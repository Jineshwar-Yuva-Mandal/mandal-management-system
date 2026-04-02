// Load Supabase auth keys from the right .env file based on NODE_ENV
// DB credentials come from .cdsrc-private.json (CDS profiles), not .env
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
require('dotenv').config({ path: envFile });
const cds = require('@sap/cds');

// ── Override DB credentials from env vars if set (for Render / cloud hosting) ──
if (process.env.DB_HOST) {
  cds.env.requires.db = Object.assign(cds.env.requires.db || {}, {
    credentials: {
      host:     process.env.DB_HOST,
      port:     parseInt(process.env.DB_PORT || '6543', 10),
      database: process.env.DB_NAME || 'postgres',
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl:      { rejectUnauthorized: false }
    }
  });
}

// ── Disable named prepared statements for PgBouncer compatibility ──
// @cap-js/postgres puts a SHA-1 `name` on every query object, creating
// named prepared statements that break with PgBouncer transaction-mode.
// We patch factory.create to wrap each new pg Client's query() method,
// stripping the `name` property before it reaches the pg wire protocol.
const PostgresService = require('@cap-js/postgres/lib/PostgresService');
const _origFactory = Object.getOwnPropertyDescriptor(PostgresService.prototype, 'factory');
Object.defineProperty(PostgresService.prototype, 'factory', {
  get() {
    const factory = _origFactory.get.call(this);
    const _origCreate = factory.create;
    factory.create = async function (...args) {
      const dbc = await _origCreate(...args);
      const _origQuery = dbc.query.bind(dbc);
      dbc.query = function (config, ...rest) {
        if (config && typeof config === 'object' && config.name) {
          // eslint-disable-next-line no-unused-vars
          const { name: _name, ...unnamed } = config;
          return _origQuery(unnamed, ...rest);
        }
        return _origQuery(config, ...rest);
      };
      return dbc;
    };
    return factory;
  }
});

// Register friendly DB error handler middleware
require('./error-handler');

cds.on('bootstrap', (app) => {
  // ── Cookie parser (needed for session cookie auth) ──
  const cookieParser = require('cookie-parser');
  app.use(cookieParser());

  // ── Health endpoint (UptimeRobot keep-alive) ──
  app.get('/healthz', (_req, res) => {
    const dbCreds = cds.env.requires?.db?.credentials || {};
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: {
        host: dbCreds.host || 'unknown',
        port: dbCreds.port || 'unknown',
        user: dbCreds.user || 'unknown',
        database: dbCreds.database || 'unknown',
        source: process.env.DB_HOST ? 'env-vars' : 'cds-config'
      },
      env: process.env.NODE_ENV || 'default'
    });
  });

  // ── Session endpoints (cookie-based auth for iframed apps) ──
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Shell calls this after login to set a session cookie
    app.post('/auth/session', async (req, res) => {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing token' });
      }
      const token = authHeader.slice(7);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      res.cookie('sb_access_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000 // 1 hour
      });
      res.json({ ok: true });
    });

    // Clear session on sign-out
    app.post('/auth/logout', (_req, res) => {
      res.clearCookie('sb_access_token');
      res.json({ ok: true });
    });
  }
});

module.exports = cds.server;
