# myStorage backend

Minimal Express API. It does not store files yet.

## Run locally

```bash
npm install
npm run dev   # auto-restart on changes (node --watch)
npm start     # plain start
```

Optionally copy `.env.example` to `.env`. `PORT` defaults to 3000.

## Endpoints

- `GET /` returns `{ "message": "myStorage API" }`
- `GET /health` returns `{ "status": "ok" }`

## Deploy on Render (Web Service)

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/health`

Render provides `PORT`; no secrets are required yet.

## Environment variables

| Variable | Local | Render |
| --- | --- | --- |
| `PORT` | `3000` (optional) | set by Render |
| `FRONTEND_ORIGIN` | `http://localhost:5173` (default outside production) | your static site URL, e.g. `https://mystorage.onrender.com` (no trailing slash; comma-separate multiple) |
| `NODE_ENV` | unset | `production` (with it set and no `FRONTEND_ORIGIN`, all cross-origin requests are rejected) |

CORS never uses a wildcard.

## Authentication

Routes: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.

- Passwords: Argon2id hashes only; plain text is never stored or returned.
- Sessions: `express-session` with a file-backed store (`SESSIONS_DIR`), cookie `sid` (HttpOnly; Secure in production; SameSite from `COOKIE_SAMESITE`). No tokens in browser storage.
- CSRF: state-changing `/api/auth/*` requests must carry an `Origin` header equal to `FRONTEND_ORIGIN`.
- Login/register are rate limited (10 attempts per IP per 15 min); login errors are generic.
- A dummy user `demo@example.com` (password `demo-password-123` unless `SEED_DEMO_PASSWORD` is set; not seeded in production without it) is added on startup.
- Users live in `USERS_FILE` (default `backend/data/users.json`, git-ignored, never served statically). Writes are serialized and atomic (temp file + fsync + rename).

| Variable | Local | Render |
| --- | --- | --- |
| `SESSION_SECRET` | optional (dev fallback) | **required**, 32+ random chars |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | static site URL, no trailing slash |
| `NODE_ENV` | unset | `production` |
| `USERS_FILE` | default | `/var/data/users.json` (persistent disk mount) |
| `COOKIE_SAMESITE` | default `lax` | default `none`; use `lax` if both services share one site (custom domains) |

### Limitations (prototype)
- A JSON file is not a production user database: it is rewritten whole on each signup, loaded per request, and supports a **single instance only** (no horizontal scaling).
- **Render's filesystem is ephemeral.** On Render Free (or any service without a disk), `users.json` and sessions are wiped on every deploy/restart/spin-down. Persistence requires a paid service with a **persistent disk** (which also restricts you to one instance); set `USERS_FILE` to a path on the disk mount.
- Registering reveals whether an email is taken (409); this is unavoidable without email verification.
- No password reset or email verification.
# node-back
# back-node
# backend-node
