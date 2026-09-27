# 🧪 Backend API — Postman Testing Guide

Complete reference for testing every endpoint of the Scholarship Management backend
(`http://localhost:5000`). All examples below use **real seeded data** and were verified
with live requests.

---

## 1. Setup

```bash
cd server
npm install
node dev-seed-server.js     # in-memory DB + auto seed, no MongoDB needed
# or: npm run seed && npm run dev   (requires local MongoDB)
```

Server runs on **http://localhost:5000**. Health check: `GET /api/health`.

### Seeded test accounts

| Role      | Email                        | Password      | ID     |
|-----------|------------------------------|---------------|--------|
| Student   | `priya.gond@email.com`       | `password123` | STU001 |
| Admin     | `rajesh.kumar@mota.gov.in`   | `password123` | ADM001 |
| Govt      | `government@mota.gov.in`     | `password123` | GOV001 |

### Postman environment setup

1. Create an environment with variables: `baseUrl = http://localhost:5000/api`, `token = ` (empty).
2. In the **Login** request add a *Tests* script to auto-save the token:
   ```js
   const res = pm.response.json();
   pm.environment.set("token", res.token);
   ```
3. For all protected requests set header:
   `Authorization: Bearer {{token}}`

---

## 2. Authentication (`/api/auth`)

### POST `/auth/login` — Public
```json
{ "email": "priya.gond@email.com", "password": "password123" }
```
**200 OK**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "STU001", "email": "priya.gond@email.com", "role": "student", "name": "Priya Gond" }
}
```
Errors: `400` missing fields · `401` invalid credentials.

### POST `/auth/register` — Public
All fields required (validated by express-validator):
```json
{
  "name": "Test Student", "email": "test@student.com", "password": "secret123",
  "phone": "9876543210", "aadharNumber": "234523452345", "stCertificateNumber": "ST/MP/2024/99999",
  "tribeName": "Gond", "state": "Madhya Pradesh", "district": "Mandla", "familyIncome": 120000,
  "bankAccountNumber": "9999888877", "bankName": "SBI", "ifscCode": "SBIN0001234",
  "courseName": "B.Tech CSE", "courseLevel": "UG", "institution": "IIT Bombay", "yearOfStudy": 2,
  "guardianName": "Suresh Gond", "guardianRelation": "Father", "guardianPhone": "9876543211"
}
```
**201 Created** → same shape as login (token + user).
Errors: `400 { errors: [{ msg: "Valid email is required" }, ...] }` · `400 "Email already registered"`.

### GET `/auth/me` — Private
→ `200` `{ id, email, role, name }`

---

## 3. Student (`/api/student`) — requires student token

### Schemes
- `GET /student/schemes` → `200` array of schemes (`SCH001` NFST ₹31,000 · `SCH002` NOS · `SCH003` NSTPS · `SCH004` NSTMS …)
- `GET /student/schemes/SCH001` → `200` single scheme / `404` if unknown

### Profile
- `GET /student/me` → `200` full student object incl. `documentVault`
- `PUT /student/me` → body (only these fields are editable):
  ```json
  { "phone": "9876500000", "guardianEmail": "guardian@mail.com", "preferredLanguage": "hi" }
  ```

### 📤 Document Vault Upload (advanced)
**POST `/student/vault/upload`** — multipart/form-data
- Form field name: **`files`** (type *File*, select multiple)
- Limits: JPG/PNG/WEBP/PDF only · ≤ 5 MB each · max 10 per request
- Files stored at `server/uploads/<STUDENT_ID>/<YYYY-MM>/<timestamp>-<safe-name>`
- Server auto-detects category from filename (`income…` → income_certificate, `marksheet…` → marksheet, `aadhaar`, `bonafide`, `research/proposal`, etc.) and assigns an AI quality score.

Postman: Body → *form-data* → key `files` → type **File** → choose file(s).

**201 Created** (verified response)
```json
{
  "message": "1 document(s) uploaded to vault",
  "documents": [{
    "_id": "VDOC1790236741831274",
    "name": "income_cert.pdf",
    "type": "application/pdf",
    "category": "income_certificate",
    "status": "pending",
    "uploadDate": "2026-09-24",
    "aiScore": 93,
    "usedInApplications": [],
    "sampleAvailable": false,
    "fileName": "1790236741827-447710809-income_cert.pdf",
    "filePath": "/uploads/STU001/2026-09/1790236741827-447710809-income_cert.pdf",
    "sizeBytes": 54
  }]
}
```
Upload error responses (`400`):
```json
{ "message": "File too large. Maximum size is 5.0 MB.", "code": "LIMIT_FILE_SIZE" }
{ "message": "Unsupported file \"virus.exe\". Only JPG, PNG, WEBP and PDF are allowed." }
{ "message": "No files received. Send multipart form-data with field name \"files\"." }
```

Other vault routes:
- `GET /student/vault` → `200` array of vault docs
- `PUT /student/vault/:docId/verify` → marks doc `verified`, bumps aiScore ≥ 90
- `DELETE /student/vault/:docId` → removes record **and** physical file
- File preview URL (no auth needed): `http://localhost:5000/uploads/STU001/2026-09/<fileName>`

### Applications (Apply for Scholarship flow)
1. **POST `/student/applications`** → creates draft
   ```json
   { "schemeId": "SCH001", "vaultDocumentIds": ["VDOC1790236741831274"] }
   ```
   **201** `APP1790236752116…` — matching vault docs are copied into `documents[]` keeping their
   verified status/AI score, and referenced in `vaultDocumentIds`.
2. **PUT `/student/applications/:id/draft`** → autosave
   ```json
   { "vaultDocumentIds": ["VDOC001"], "draftProgress": 66 }
   ```
3. **PUT `/student/applications/:id/documents`** — multipart, field name **`documents`** (same file rules).
   Verified response: appends `("marksheet.pdf","pending")` to the application's docs; auto-resolves
   matching deficiency notices.
4. **PUT `/student/applications/:id/submit`** → validates ≥1 document then flips status.
   - `200` → `"status": "submitted"` (+ statusHistory entry)
   - `400` → `{ "message": "Please attach at least one document before submitting." }`
5. `GET /student/applications/my` → all own applications · `GET /student/applications/:id` → one.
6. `PUT /student/applications/:id/enrolment` → confirm enrolment
7. `PUT /student/applications/:id/attendance` → `{ "percentage": 88 }` (0–100 validated)

### Grievances
- `POST /student/grievances`
  ```json
  { "subject": "Payment not received", "description": "Scholarship for Jan not credited.",
    "priority": "high", "needsAssistance": true, "assistanceType": "CSC visit" }
  ```
  → `201` grievance with generated `GRV…` id, status `open`
- `GET /student/grievances/my` → list

### Notifications
- `GET /student/notifications/my` → list (seeded for STU001)
- `PUT /student/notifications/:id/read` → marks read

### Disbursals
- `GET /student/disbursals/my` → payments for own applications

---

## 4. Admin (`/api/admin`) — requires admin token

| Endpoint | Method | Body / Notes |
|---|---|---|
| `/admin/applications?status=submitted&scheme=SCH001&state=Gujarat&q=priya` | GET | filters optional |
| `/admin/applications/APP001` | GET | |
| `/admin/applications/APP001/status` | PUT | `{ "status": "selected", "remark": "Merit-based selection" }` — status ∈ draft/submitted/under_scrutiny/screening/selected/waitlisted/rejected |
| `/admin/applications/bulk-status` | PUT | `{ "ids": ["APP002","APP003"], "status": "under_scrutiny", "remark": "batch" }` |
| `/admin/schemes` | GET/POST | POST body = scheme fields (`_id` auto-generated) |
| `/admin/schemes/SCH001` | PUT | partial update |
| `/admin/merit-list/SCH001` | GET | ranked selected apps |
| `/admin/communications` | POST | `{ "title": "...", "message": "...", "targetRoles": ["student"], "targetStates": ["MP"] }` → creates notifications |
| `/admin/audit-log` | GET | all actions |
| `/admin/disbursals` | GET | |
| `/admin/disbursals/DIS001` | PUT | e.g. `{ "status": "success", "utrNumber": "UTR123" }` |
| `/admin/grievances` | GET | |
| `/admin/grievances/GRV001` | PUT | `{ "status": "resolved", "response": "Payment re-initiated." }` |

Wrong-role access returns `403`.

---

## 5. Government (`/api/gov`) — gov or admin token

- `GET /gov/dashboard-summary` → totals, state-wise breakdown, funnel counts
- `GET /gov/scheme-performance` → per-scheme applications/selection/disbursement metrics
- `GET /gov/budget-overview` → allocated vs spent per scheme
- `GET /gov/export?type=applications` → CSV download (`Content-Type: text/csv`); also `type=disbursals`

---

## 6. Quick curl smoke-test (copy-paste)

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"priya.gond@email.com","password":"password123"}' | jq -r .token)

# upload to vault
curl -X POST http://localhost:5000/api/student/vault/upload \
  -H "Authorization: Bearer $TOKEN" -F files=@income_cert.pdf

# create draft with a vault doc, then submit
curl -X POST http://localhost:5000/api/student/applications \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"schemeId":"SCH001","vaultDocumentIds":["VDOC001"]}'

curl -X PUT http://localhost:5000/api/student/applications/<APPID>/submit \
  -H "Authorization: Bearer $TOKEN"
```

## 7. Error format & status codes

| Code | Meaning |
|------|---------|
| 400 | Validation / upload rule violation (`{ "message": ... }` or `{ "errors": [...] }`) |
| 401 | Missing/expired token — re-login |
| 403 | Wrong role or accessing someone else's resource |
| 404 | Resource not found |
| 500 | Server error (`{ "message": "Server error", "error": ... }`) |
