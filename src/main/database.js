const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const Database = require('better-sqlite3');

// DB file lives in the OS-appropriate userData folder, e.g.
// C:\Users\<user>\AppData\Roaming\Shop Attendance\attendance.db on Windows.
// This keeps the app fully offline and self-contained per machine.
const DB_PATH = path.join(app.getPath('userData'), 'attendance.db');
const SCHEMA_PATH = path.join(__dirname, '..', '..', 'sql', 'updated-schema.sql');

let db;

function initDatabase() {
  const isNewDb = !fs.existsSync(DB_PATH);
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Always run the current schema - CREATE TABLE IF NOT EXISTS statements
  // make this safe to run every launch, so new installs and existing ones
  // both end up structurally up to date with sql/updated-schema.sql.
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schemaSql);

  return { db, isNewDb };
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

module.exports = { initDatabase, getDb, DB_PATH };
