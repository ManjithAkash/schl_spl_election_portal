/**
 * server.js
 * Main Express server for KPS SPL Voting System
 * Start: node server.js
 */

const express = require('express');
const cors    = require('cors');
const session = require('express-session');
const path    = require('path');

const authRoutes  = require('./routes/auth');
const voteRoutes  = require('./routes/vote');
const adminRoutes = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS — allow the frontend origin (update in production)
app.use(cors({
  origin: true,          // reflects request origin; lock this down in production
  credentials: true,     // required for session cookies
}));

// Session
app.use(session({
  secret:            process.env.SESSION_SECRET || 'kps-spl-secret-2025',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production', // HTTPS only in prod
    maxAge:   1000 * 60 * 30,   // 30 minutes
  },
}));

// ── Serve frontend ─────────────────────────────────────────────
// Put your index.html in the /public folder
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ─────────────────────────────────────────────────
app.use('/api', authRoutes);
app.use('/api', voteRoutes);
app.use('/api/admin', adminRoutes);

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── Admin panel (staff only — served separately from student portal) ──
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ── Catch-all → serve student frontend ────────────────────────
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏫  KPS Voting Server running on http://localhost:${PORT}`);
  console.log(`    API ready at http://localhost:${PORT}/api\n`);
});
