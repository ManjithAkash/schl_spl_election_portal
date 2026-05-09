/**
 * api.js  ──  Drop-in API layer for index.html
 *
 * Replace the mock DB block and the three functions
 * (handleLogin, castVote, logout) in index.html with
 * the versions below.
 *
 * Also add at the top of your <script>:
 *   const API_BASE = 'http://localhost:3000/api';
 */

const API_BASE = 'http://localhost:3000/api'; // change to your server URL in production

// ── Helper ─────────────────────────────────────────────────────
async function apiPost(endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method:      'POST',
    headers:     { 'Content-Type': 'application/json' },
    credentials: 'include',          // send/receive session cookie
    body:        JSON.stringify(body),
  });
  return res.json();
}

// ── LOGIN ──────────────────────────────────────────────────────
async function handleLogin() {
  const name     = document.getElementById('studentName').value.trim();
  const admNo    = document.getElementById('admNo').value.trim();
  const err      = document.getElementById('errorMsg');

  err.classList.remove('show');

  if (!name || !admNo) {
    err.textContent = '⚠ Please enter both your name and admission number.';
    err.classList.add('show');
    return;
  }

  try {
    const data = await apiPost('/login', { name, admission_no: admNo });

    if (!data.success) {
      err.textContent = '⚠ ' + data.message;
      err.classList.add('show');
      return;
    }

    currentStudent = { name: data.name, has_voted: data.has_voted };
    document.getElementById('loggedInName').textContent = data.name;

    if (data.has_voted) {
      showPage('alreadyVotedPage');
    } else {
      buildCandidateGrid();
      showPage('votePage');
    }
  } catch (e) {
    err.textContent = '⚠ Could not reach server. Please try again.';
    err.classList.add('show');
  }
}

// ── CAST VOTE ──────────────────────────────────────────────────
async function castVote(candidate) {
  try {
    const data = await apiPost('/vote', { candidate_name: candidate.name });

    document.getElementById('overlay').classList.remove('show');

    if (!data.success) {
      // Edge case: voted from another tab, etc.
      showPage('alreadyVotedPage');
      return;
    }

    document.getElementById('thankMsg').innerHTML =
      `Your vote for <strong>${candidate.name}</strong> has been recorded successfully.<br/>
       Every vote counts — you've helped shape the future of Kutty Public School!`;

    showPage('thankYouPage');
    currentStudent = null;
    clearTimeout(autoLogoutTimer);
    autoLogoutTimer = setTimeout(logout, 5000);

  } catch (e) {
    console.error('Vote submission failed:', e);
  }
}

// ── LOGOUT ─────────────────────────────────────────────────────
async function logout() {
  clearTimeout(autoLogoutTimer);
  autoLogoutTimer = null;
  currentStudent  = null;

  // Tell server to destroy session
  try { await apiPost('/logout', {}); } catch (_) {}

  document.getElementById('studentName').value = '';
  document.getElementById('admNo').value       = '';
  document.getElementById('errorMsg').classList.remove('show');
  showPage('loginPage');
}
