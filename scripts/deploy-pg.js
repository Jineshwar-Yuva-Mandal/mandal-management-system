#!/usr/bin/env node
/**
 * Deploy CDS schema to PostgreSQL (idempotent + auto-migration).
 * - New tables: created via IF NOT EXISTS
 * - Changed tables: new columns added via ALTER TABLE ADD COLUMN IF NOT EXISTS
 * - Views: replaced via CREATE OR REPLACE VIEW
 * - Existing data: never dropped or deleted
 *
 * Usage: NODE_ENV=production node scripts/deploy-pg.js
 */
const { execSync } = require('child_process');
const { Client } = require('pg');

function parseDDL(sql) {
  const tables = [];
  const views = [];
  const other = [];

  // Split on semicolons, trim, filter empty
  const statements = sql.split(';').map(s => s.trim()).filter(Boolean);

  for (const stmt of statements) {
    const tableMatch = stmt.match(/^CREATE TABLE\s+(\S+)\s*\(([\s\S]*)\)$/i);
    if (tableMatch) {
      const name = tableMatch[1].toLowerCase();
      const body = tableMatch[2];
      // Parse columns — each line is a column def or constraint
      const cols = body.split(',').map(c => c.trim()).filter(Boolean);
      const columns = [];
      for (const col of cols) {
        // Skip PRIMARY KEY(...) constraints
        if (/^PRIMARY\s+KEY/i.test(col)) continue;
        // Column: name TYPE [DEFAULT ...] [NOT NULL]
        const parts = col.match(/^(\S+)\s+([\s\S]+)$/);
        if (parts) {
          columns.push({ name: parts[1].toLowerCase(), definition: col });
        }
      }
      tables.push({ name, columns, raw: stmt });
      continue;
    }

    const viewMatch = stmt.match(/^CREATE VIEW\s+/i);
    if (viewMatch) {
      views.push(stmt);
      continue;
    }

    other.push(stmt);
  }

  return { tables, views, other };
}

async function main() {
  let sql = execSync('npx cds compile "*" --to sql --dialect postgres', { encoding: 'utf8' });
  console.log('[deploy-pg] Generated DDL:', sql.split('\n').length, 'lines');

  const c = new Client({
    host: process.env.CDS_REQUIRES_DB_CREDENTIALS_HOST,
    port: parseInt(process.env.CDS_REQUIRES_DB_CREDENTIALS_PORT || '5432'),
    database: process.env.CDS_REQUIRES_DB_CREDENTIALS_DATABASE || 'postgres',
    user: process.env.CDS_REQUIRES_DB_CREDENTIALS_USER,
    password: process.env.CDS_REQUIRES_DB_CREDENTIALS_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  await c.connect();
  console.log('[deploy-pg] Connected to Postgres');

  // Get existing tables and their columns
  const existing = await c.query(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `);
  const existingMap = {};
  for (const row of existing.rows) {
    if (!existingMap[row.table_name]) existingMap[row.table_name] = new Set();
    existingMap[row.table_name].add(row.column_name.toLowerCase());
  }

  const { tables, views, other } = parseDDL(sql);
  let created = 0, altered = 0, skipped = 0;

  // Process tables
  for (const table of tables) {
    if (!existingMap[table.name]) {
      // New table — create it
      await c.query(table.raw);
      created++;
      console.log('[deploy-pg] CREATE TABLE', table.name);
    } else {
      // Existing table — check for new columns
      const existingCols = existingMap[table.name];
      for (const col of table.columns) {
        if (!existingCols.has(col.name)) {
          const alterSQL = `ALTER TABLE ${table.name} ADD COLUMN IF NOT EXISTS ${col.definition}`;
          await c.query(alterSQL);
          altered++;
          console.log('[deploy-pg] ADD COLUMN', table.name + '.' + col.name);
        }
      }
      skipped++;
    }
  }

  // Process views — always replace, with security_invoker for RLS
  for (const viewSQL of views) {
    const replaced = viewSQL
      .replace(/^CREATE VIEW/i, 'CREATE OR REPLACE VIEW')
      .replace(/\bAS\s+SELECT/i, 'WITH (security_invoker = on) AS SELECT');
    await c.query(replaced);
  }

  // Process other statements (e.g., indexes)
  for (const stmt of other) {
    try {
      await c.query(stmt);
    } catch (e) {
      // Ignore "already exists" errors for indexes etc.
      if (!e.message.includes('already exists')) throw e;
    }
  }

  const res = await c.query("SELECT count(*) as cnt FROM pg_tables WHERE schemaname='public'");
  console.log(`[deploy-pg] Done — ${created} created, ${altered} columns added, ${skipped} unchanged, ${res.rows[0].cnt} total tables`);

  await c.end();
}

main().catch(e => { console.error('[deploy-pg] FAILED:', e.message); process.exit(1); });
