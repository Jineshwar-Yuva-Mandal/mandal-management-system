#!/usr/bin/env node

/**
 * Custom deploy script for Supabase PostgreSQL.
 *
 * Workarounds:
 *  1. `cds deploy --to postgres` has a bug that writes to a SQLite file
 *     named "[object Object]" instead of executing against the DB.
 *  2. Supabase's transaction-mode pooler (port 5432) rejects multi-statement
 *     prepared statements, so even a fixed CDS deploy would fail there.
 *
 * This script generates DDL via `cds deploy --to postgres --dry` and then
 * executes it against the database using the raw pg client (simple query
 * protocol), which works through both pooler modes.
 *
 * Usage:
 *   node scripts/deploy-pg.js              # deploy using default (dev) credentials
 *   NODE_ENV=production node scripts/deploy-pg.js   # deploy using production credentials
 */

const { execSync } = require('child_process');
const { Client } = require('pg');
const cds = require('@sap/cds');

async function main() {
  const env = process.env.NODE_ENV || 'development';
  console.log(`[deploy-pg] Environment: ${env}`);

  // 1. Generate DDL
  console.log('[deploy-pg] Generating DDL...');
  const sql = execSync('npx cds deploy --to postgres --dry', {
    encoding: 'utf8',
    cwd: cds.root,
    env: { ...process.env }
  });

  if (!sql || !sql.trim()) {
    console.error('[deploy-pg] ERROR: DDL generation produced no output.');
    process.exit(1);
  }

  const stmtCount = (sql.match(/;/g) || []).length;
  console.log(`[deploy-pg] Generated ${stmtCount} SQL statements (${sql.length} chars)`);

  // 2. Resolve credentials from CDS config
  const creds = cds.requires.db?.credentials;
  if (!creds?.host || !creds?.user) {
    console.error('[deploy-pg] ERROR: No database credentials found. Check .cdsrc-private.json');
    process.exit(1);
  }

  console.log(`[deploy-pg] Target: ${creds.user}@${creds.host}:${creds.port}/${creds.database}`);

  // 3. Connect and execute
  const client = new Client({
    host: creds.host,
    port: creds.port,
    database: creds.database,
    user: creds.user,
    password: creds.password,
    ssl: creds.ssl
  });

  await client.connect();

  try {
    await client.query(sql);
    console.log('[deploy-pg] Schema deployed successfully.');

    // 4. Verify
    const tables = await client.query(
      "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'"
    );
    const views = await client.query(
      "SELECT count(*) FROM information_schema.views WHERE table_schema = 'public'"
    );
    console.log(`[deploy-pg] Verification: ${tables.rows[0].count} tables/views total, ${views.rows[0].count} views`);
  } catch (err) {
    console.error('[deploy-pg] ERROR executing DDL:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error('[deploy-pg] Fatal error:', err.message);
  process.exit(1);
});
