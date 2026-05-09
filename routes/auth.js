/**
 * routes/auth.js
 * POST /api/login   — authenticate student
 * POST /api/logout  — destroy session
 */

const express = require('express');
const bcrypt  = require('bcryptjs');
const db      = require('../db/database');

const router = express.Router();

// ── POST /api/login ────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { name, admission_no } = req.body;

    if (!name || !admission_no) {
      return res.status(400).json({ success: false, message: 'Name and admission number are required.' });
    }

    // Case-insensitive name match
    const student = await db.get(
      'SELECT * FROM students WHERE LOWER(name) = LOWER(?)',
      [name.trim()]
    );

    if (!student) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please try again.' });
    }

    const passwordMatch = bcrypt.compareSync(admission_no.trim(), student.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please try again.' });
    }

    // Store student in session (exclude hash)
    req.session.student = {
      id:           student.id,
      name:         student.name,
      admission_no: student.admission_no,
      has_voted:    student.has_voted === 1,
    };

    return res.json({
      success:   true,
      name:      student.name,
      has_voted: student.has_voted === 1,
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ── POST /api/logout ───────────────────────────────────────────
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// ── GET /api/session ──────────────────────────────────────────
// Frontend can ping this on load to check if still logged in
router.get('/session', (req, res) => {
  if (req.session.student) {
    return res.json({ loggedIn: true, student: req.session.student });
  }
  res.json({ loggedIn: false });
});

module.exports = router;
