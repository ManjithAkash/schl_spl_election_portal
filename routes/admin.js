/**
 * routes/admin.js
 * POST /api/admin/login   — staff authentication
 * POST /api/admin/logout  — destroy staff session
 * GET  /api/admin/results — full vote counts + winner (requires staff session)
 */

const express = require('express');
const db      = require('../db/database');

const router = express.Router();

// ── Staff credentials (change before deployment) ───────────────
// In production: store these in environment variables / .env file
const STAFF_CREDENTIALS = [
  { username: 'principal',  password: 'KPS@Principal2025' },
  { username: 'headmaster', password: 'KPS@HM2025'        },
  { username: 'staff',      password: 'KPS@Staff2025'     },
];

// ── Staff auth middleware ──────────────────────────────────────
function requireStaff(req, res, next) {
  if (!req.session || !req.session.staff) {
    return res.status(401).json({ success: false, message: 'Staff login required.' });
  }
  next();
}

// ── POST /api/admin/login ──────────────────────────────────────
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required.' });
  }

  const match = STAFF_CREDENTIALS.find(
    c => c.username === username.trim() && c.password === password
  );

  if (!match) {
    return res.status(401).json({ success: false, message: 'Invalid staff credentials.' });
  }

  req.session.staff = { username: match.username };
  return res.json({ success: true, username: match.username });
});

// ── POST /api/admin/logout ─────────────────────────────────────
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// ── GET /api/admin/results ─────────────────────────────────────
router.get('/results', requireStaff, async (req, res) => {
  try {
    // Candidate vote counts
    const candidates = await db.all(`
      SELECT
        c.id,
        c.name,
        c.tagline,
        c.class_section,
        c.vote_count,
        ROUND(c.vote_count * 100.0 / MAX(total.cnt, 1), 1) AS percentage
      FROM candidates c
      CROSS JOIN (SELECT COUNT(*) AS cnt FROM votes) AS total
      ORDER BY c.vote_count DESC, c.name ASC
    `);

    // Total votes cast
    const totals = await db.get(`
      SELECT
        COUNT(*)                                    AS total_votes,
        (SELECT COUNT(*) FROM students)             AS total_students,
        (SELECT COUNT(*) FROM students WHERE has_voted = 1) AS voted_count
    `);

    // Election status
    const winner = candidates[0]?.vote_count > 0 ? candidates[0] : null;
    const isTie  = candidates.length > 1 &&
                   candidates[0].vote_count === candidates[1].vote_count &&
                   candidates[0].vote_count > 0;

    res.json({
      success:    true,
      stats: {
        total_students:  totals.total_students,
        votes_cast:      totals.voted_count,
        votes_remaining: totals.total_students - totals.voted_count,
        turnout_pct:     totals.total_students > 0
          ? Math.round((totals.voted_count / totals.total_students) * 100)
          : 0,
      },
      candidates,
      winner: isTie ? null : winner,
      is_tie: isTie,
      generated_at: new Date().toISOString(),
    });

  } catch (err) {
    console.error('Results error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── GET /api/admin/session ─────────────────────────────────────
router.get('/session', (req, res) => {
  if (req.session?.staff) return res.json({ loggedIn: true, username: req.session.staff.username });
  res.json({ loggedIn: false });
});

module.exports = router;
