/**
 * routes/vote.js
 * POST /api/vote          — cast a vote (requires session)
 * GET  /api/candidates    — list all candidates
 */

const express = require('express');
const db      = require('../db/database');

const router = express.Router();

// ── Auth middleware ────────────────────────────────────────────
function requireLogin(req, res, next) {
  if (!req.session || !req.session.student) {
    return res.status(401).json({ success: false, message: 'Not logged in.' });
  }
  next();
}

// ── GET /api/candidates ────────────────────────────────────────
router.get('/candidates', async (req, res) => {
  try {
    const candidates = await db.all(
      'SELECT id, name, tagline, class_section FROM candidates ORDER BY id'
    );
    res.json({ success: true, candidates });
  } catch (err) {
    console.error('Candidates error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── POST /api/vote ─────────────────────────────────────────────
router.post('/vote', requireLogin, async (req, res) => {
  try {
    const studentId   = req.session.student.id;
    const { candidate_name } = req.body;

    if (!candidate_name) {
      return res.status(400).json({ success: false, message: 'Candidate name is required.' });
    }

    // Re-check from DB (session might be stale)
    const student = await db.get('SELECT * FROM students WHERE id = ?', [studentId]);
    if (!student) {
      return res.status(401).json({ success: false, message: 'Student not found.' });
    }
    if (student.has_voted === 1) {
      return res.status(409).json({ success: false, message: 'You have already voted.' });
    }

    // Find candidate
    const candidate = await db.get(
      'SELECT * FROM candidates WHERE LOWER(name) = LOWER(?)',
      [candidate_name.trim()]
    );
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    const now = new Date().toISOString();

    // Record the vote
    await db.run(
      'INSERT INTO votes (student_id, candidate_id, voted_at) VALUES (?, ?, ?)',
      [studentId, candidate.id, now]
    );

    // Mark student as voted
    await db.run(
      'UPDATE students SET has_voted = 1, voted_at = ? WHERE id = ?',
      [now, studentId]
    );

    // Increment candidate vote count
    await db.run(
      'UPDATE candidates SET vote_count = vote_count + 1 WHERE id = ?',
      [candidate.id]
    );

    // Update session
    req.session.student.has_voted = true;

    return res.json({
      success:        true,
      message:        `Vote for ${candidate.name} recorded successfully.`,
      candidate_name: candidate.name,
    });

  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

module.exports = router;
