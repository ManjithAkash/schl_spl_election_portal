/**
 * db/init.js
 * Initialises the SQLite database and seeds student + candidate data.
 * Run once:  node db/init.js
 */

const path = require('path');
const fs   = require('fs');
const initSqlJs = require('sql.js');
const bcrypt    = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'kps.db');

// ─── Candidate list ───────────────────────────────────────────
const CANDIDATES = [
  { name: 'Manjit', tagline: 'Unity & Strength',    class_section: 'XII A' },
  { name: 'Harsha', tagline: 'Rising Star',          class_section: 'XI B'  },
  { name: 'Vijay',  tagline: 'Victory Forward',      class_section: 'XII B' },
  { name: 'Hari',   tagline: 'Hope & Progress',      class_section: 'XI A'  },
  { name: 'Virat',  tagline: 'Lead with Power',      class_section: 'XII C' },
  { name: 'Riya',   tagline: 'Care & Change',        class_section: 'XI C'  },
  { name: 'Tamil',  tagline: 'Culture & Pride',      class_section: 'XII D' },
  { name: 'Suchir', tagline: 'Focus & Service',      class_section: 'XI D'  },
];

// ─── Student list  (name, admission_no) ───────────────────────
// admission_no is stored as a bcrypt hash and also used as the login password
const STUDENTS = [
  { name: 'Arjun Kumar',   admission_no: 'KPS2024001' },
  { name: 'Priya Sharma',  admission_no: 'KPS2024002' },
  { name: 'Rajan Das',     admission_no: 'KPS2024003' },
  { name: 'Meena Pillai',  admission_no: 'KPS2024004' },
  { name: 'Karthik S',     admission_no: 'KPS2024005' },
  { name: 'Divya R',       admission_no: 'KPS2024006' },
  { name: 'Surya Prakash', admission_no: 'KPS2024007' },
  { name: 'Lakshmi N',     admission_no: 'KPS2024008' },
  { name: 'Arun Babu',     admission_no: 'KPS2024009' },
  { name: 'Nithya K',      admission_no: 'KPS2024010' },
];

async function main() {
  const SQL = await initSqlJs();

  // If DB already exists load it, else create fresh
  let db;
  if (fs.existsSync(DB_PATH)) {
    const data = fs.readFileSync(DB_PATH);
    db = new SQL.Database(data);
    console.log('Existing database loaded. Re-seeding…');
  } else {
    db = new SQL.Database();
    console.log('Creating new database…');
  }

  // ── Schema ────────────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      admission_no  TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      has_voted     INTEGER NOT NULL DEFAULT 0,
      voted_at      TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS candidates (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL UNIQUE,
      tagline       TEXT,
      class_section TEXT,
      vote_count    INTEGER NOT NULL DEFAULT 0
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS votes (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id   INTEGER NOT NULL REFERENCES students(id),
      candidate_id INTEGER NOT NULL REFERENCES candidates(id),
      voted_at     TEXT NOT NULL
    );
  `);

  // ── Seed Candidates ───────────────────────────────────────────
  db.run('DELETE FROM candidates;');
  for (const c of CANDIDATES) {
    db.run(
      'INSERT INTO candidates (name, tagline, class_section) VALUES (?, ?, ?);',
      [c.name, c.tagline, c.class_section]
    );
  }
  console.log(`✓ Seeded ${CANDIDATES.length} candidates`);

  // ── Seed Students ─────────────────────────────────────────────
  db.run('DELETE FROM students;');
  db.run('DELETE FROM votes;');
  for (const s of STUDENTS) {
    const hash = bcrypt.hashSync(s.admission_no, 10);
    db.run(
      'INSERT INTO students (name, admission_no, password_hash) VALUES (?, ?, ?);',
      [s.name, s.admission_no, hash]
    );
  }
  console.log(`✓ Seeded ${STUDENTS.length} students`);

  // ── Persist to disk ───────────────────────────────────────────
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  db.close();
  console.log(`✓ Database saved → ${DB_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
