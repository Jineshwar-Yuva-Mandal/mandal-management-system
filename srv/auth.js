/**
 * Custom CDS auth strategy for Supabase.
 * Validates Supabase JWT (from Bearer header or session cookie)
 * and creates a proper cds.User with roles.
 *
 * With this, CDS annotations like @(requires: 'authenticated-user')
 * actually enforce authentication — no more "dummy" bypass.
 */
module.exports = function supabase_auth() {
  const cds = require('@sap/cds');
  const LOG = cds.log('auth');
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

  let supabase;
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return async function supabase_auth(req, _res, next) {
    // Extract token from Bearer header or session cookie
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (req.cookies?.sb_access_token) {
      token = req.cookies.sb_access_token;
    }

    // No token or no Supabase config → anonymous user (PublicService allows this)
    if (!token || !supabase) {
      req.user = new cds.User.Anonymous();
      return next();
    }

    // Validate token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      LOG.warn('Token validation failed:', error?.message || 'no user returned');
      req.user = new cds.User.Anonymous();
      return next();
    }

    // Create authenticated CDS user with email as ID
    req.user = new cds.User({
      id: user.email,
      roles: ['authenticated-user'],
      attr: { supabaseId: user.id }
    });

    // Also store full Supabase user data on the Express request for handlers
    req.supabaseUser = user;
    next();
  };
};
