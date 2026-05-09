# 🏫 Kutty Public School — SPL Voting System (Backend)

## Project Structure

```
kps-backend/
├── db/
│   ├── init.js        ← seeds the SQLite database
│   └── database.js    ← DB helper (run / get / all)
├── routes/
│   ├── auth.js        ← POST /api/login, POST /api/logout, GET /api/session
│   └── vote.js        ← POST /api/vote, GET /api/candidates
├── public/
│   ├── index.html     ← your frontend (copy here)
│   └── api.js         ← frontend API integration layer
├── server.js          ← Express entry point
└── package.json
```

---

## ⚡ Quick Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Seed the database (run once)
```bash
npm run seed
```
This creates `db/kps.db` with all students and candidates pre-loaded.

### 3. Copy your frontend
```bash
# Copy your index.html into the public folder
cp /path/to/index.html public/index.html
```

### 4. Patch the frontend
In `public/index.html`, make three changes:

**a) Remove the mock DB block** (the `const DB = { students: [...] }` object)

**b) Add the API script tag** just before `</body>`:
```html
<script src="api.js"></script>
```

**c) Remove** the old `handleLogin`, `castVote`, and `logout` functions from the inline `<script>` — they're now in `api.js`.

### 5. Start the server
```bash
npm start
# or for live-reload during development:
npm run dev
```

Visit: **http://localhost:3000**

---

## 🔌 API Endpoints

| Method | Endpoint           | Description                          |
|--------|--------------------|--------------------------------------|
| POST   | `/api/login`       | Authenticate student                 |
| POST   | `/api/logout`      | Destroy session                      |
| GET    | `/api/session`     | Check current login status           |
| GET    | `/api/candidates`  | List all candidates                  |
| POST   | `/api/vote`        | Cast a vote (requires login)         |
| GET    | `/api/health`      | Server health check                  |

### POST `/api/login`
```json
Request:  { "name": "Arjun Kumar", "admission_no": "KPS2024001" }
Response: { "success": true, "name": "Arjun Kumar", "has_voted": false }
```

### POST `/api/vote`
```json
Request:  { "candidate_name": "Vijay" }
Response: { "success": true, "message": "Vote for Vijay recorded.", "candidate_name": "Vijay" }
```

---

## 👨‍🎓 Test Student Credentials

| Name            | Admission No  |
|-----------------|---------------|
| Arjun Kumar     | KPS2024001    |
| Priya Sharma    | KPS2024002    |
| Rajan Das       | KPS2024003    |
| Meena Pillai    | KPS2024004    |
| Karthik S       | KPS2024005    |
| Divya R         | KPS2024006    |
| Surya Prakash   | KPS2024007    |
| Lakshmi N       | KPS2024008    |
| Arun Babu       | KPS2024009    |
| Nithya K        | KPS2024010    |

---

## 🛡️ Security Notes
- Passwords (admission numbers) are stored as **bcrypt hashes** — never plain text
- Sessions use **httpOnly cookies** (not accessible from JS)
- Each student can only vote **once** — enforced at DB level
- In production: set `NODE_ENV=production` and use HTTPS

---

## 🗄️ Adding More Students
Edit the `STUDENTS` array in `db/init.js` and re-run:
```bash
npm run seed
```
> ⚠️ This resets all votes. Do this **before** the election starts.
