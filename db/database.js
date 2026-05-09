/**
 * db/database.js
 * Singleton wrapper around sql.js.
 * Exposes run / get / all / persist helpers.
 */

const path      = require('path');
const fs        = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = path.join(__dirname, 'kps.db');

let _db   = null;
let _SQL  = null;

async function getDb() {
  if (_db) return _db;

  _SQL = await initSqlJs();

  if (!fs.existsSync(DB_PATH)) {
    throw new Error(
      `Database not found at ${DB_PATH}.\nRun "node db/init.js" first.`
    );
  }

  const data = fs.readFileSync(DB_PATH);
  _db = new _SQL.Database(data);
  return _db;
}

/** Write changes back to disk */
function persist() {
  if (!_db) return;
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

/** Execute a statement (INSERT / UPDATE / DELETE) */
async function run(sql, params = []) {
  const db = await getDb();
  db.run(sql, params);
  persist();
}

/** Fetch a single row */
async function get(sql, params = []) {
  const db  = await getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

/** Fetch all matching rows */
async function all(sql, params = []) {
  const db   = await getDb();
  const stmt  = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

module.exports = { run, get, all, persist };
