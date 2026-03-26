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
 *   node scripts/deploy-pg.js                        # schema only (dev)
 *   node scripts/deploy-pg.js --seed                 # schema + CSV seed data (dev)
 *   NODE_ENV=production node scripts/deploy-pg.js    # schema only (prod)
 */

const { execSync } = require('child_process');
const { Client } = require('pg');
const cds = require('@sap/cds');
const fs = require('fs');
const path = require('path');

const SEED_FLAG = process.argv.includes('--seed');

// ─── CSV file → PostgreSQL table name mapping ───
// CSV: "com.samanvay-Positions.csv" → table: "com_samanvay_positions"
// CSV: "sap.common-Countries.csv"   → table: "sap_common_countries"
function csvFileToTableName(filename) {
  return filename
    .replace(/\.csv$/, '')        // strip extension
    .replace(/\./g, '_')          // dots → underscores
    .replace(/-/g, '_')           // hyphens → underscores
    .toLowerCase();
}

// ─── Parse a CSV line handling quoted fields with commas ───
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

// ─── Load order: tables with foreign keys must be loaded after their references ───
const LOAD_ORDER = [
  'sap.common-Countries.csv',
  'sap.common-Countries.texts.csv',
  'com.samanvay-Users.csv',
  'com.samanvay-Mandals.csv',
  'com.samanvay-MandalMemberships.csv',
  'com.samanvay-Positions.csv',
  'com.samanvay-UserPositionAssignments.csv',
  'com.samanvay-ProtectedEntities.csv',
  'com.samanvay-ProtectedFields.csv',
  'com.samanvay-EntityPermissions.csv',
  'com.samanvay-FieldPermissions.csv',
  'com.samanvay-Events.csv',
  'com.samanvay-EventAttendance.csv',
  'com.samanvay-Fines.csv',
  'com.samanvay-LedgerEntries.csv',
  'com.samanvay-Courses.csv',
  'com.samanvay-SyllabusTopics.csv',
  'com.samanvay-CourseAssignments.csv',
  'com.samanvay-CourseTopicProgress.csv',
  'com.samanvay-ApprovalWorkflows.csv',
  'com.samanvay-ApprovalWorkflowSteps.csv',
  'com.samanvay-MembershipRequests.csv',
  'com.samanvay-MembershipApprovals.csv',
  'com.samanvay-MandalMemberFieldConfigs.csv',
];

async function seedCSV(client) {
  const dataDir = path.join(cds.root, 'db', 'data');
  if (!fs.existsSync(dataDir)) {
    console.log('[deploy-pg] No db/data/ directory found, skipping seed.');
    return;
  }

  const allFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));

  // Use load order, then append any remaining files not in the list
  const ordered = LOAD_ORDER.filter(f => allFiles.includes(f));
  const remaining = allFiles.filter(f => !LOAD_ORDER.includes(f));
  const filesToLoad = [...ordered, ...remaining];

  console.log(`[deploy-pg] Seeding ${filesToLoad.length} CSV files...`);

  let totalRows = 0;
  for (const file of filesToLoad) {
    const tableName = csvFileToTableName(file);
    const filePath = path.join(dataDir, file);
    const content = fs.readFileSync(filePath, 'utf8').trim();
    const lines = content.split('\n');

    if (lines.length < 2) {
      console.log(`  [skip] ${file} (no data rows)`);
      continue;
    }

    const headers = parseCSVLine(lines[0]);
    // Map CSV headers to PostgreSQL column names (lowercase, dots/spaces to underscores)
    const columns = headers.map(h => h.trim().toLowerCase().replace(/\./g, '_'));
    const quotedCols = columns.map(c => `"${c}"`).join(', ');

    // Build INSERT values
    const valueRows = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const fields = parseCSVLine(line);
      const escaped = fields.map(val => {
        if (val === '' || val === undefined) return 'NULL';
        // Boolean handling
        if (val === 'true') return 'TRUE';
        if (val === 'false') return 'FALSE';
        // Escape single quotes for SQL
        const safe = val.replace(/'/g, "''");
        return `'${safe}'`;
      });
      valueRows.push(`(${escaped.join(', ')})`);
    }

    if (valueRows.length === 0) {
      console.log(`  [skip] ${file} (no data rows)`);
      continue;
    }

    // UPSERT: INSERT ... ON CONFLICT DO NOTHING (idempotent)
    const sql = `INSERT INTO "${tableName}" (${quotedCols}) VALUES\n${valueRows.join(',\n')}\nON CONFLICT DO NOTHING;`;

    try {
      const result = await client.query(sql);
      const inserted = result.rowCount || 0;
      totalRows += inserted;
      console.log(`  [seed] ${file} → ${tableName}: ${inserted}/${valueRows.length} rows`);
    } catch (err) {
      console.error(`  [ERROR] ${file} → ${tableName}: ${err.message}`);
    }
  }

  console.log(`[deploy-pg] Seeding complete: ${totalRows} rows inserted.`);
}

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
    // Drop all existing public tables/views first to avoid dependency errors
    await client.query(`
      DO $$ DECLARE r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS "' || r.tablename || '" CASCADE';
        END LOOP;
        FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP VIEW IF EXISTS "' || r.viewname || '" CASCADE';
        END LOOP;
      END $$;
    `);

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

    // 5. Seed CSV data if --seed flag is set
    if (SEED_FLAG) {
      await seedCSV(client);
    }
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
