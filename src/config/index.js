const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = (
  process.env.FRONTEND_ORIGIN || (isProduction ? '' : 'http://localhost:5173')
)
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

if (allowedOrigins.includes('*')) {
  throw new Error('FRONTEND_ORIGIN must not be a wildcard');
}

const sessionSecret = process.env.SESSION_SECRET;
if (isProduction && (!sessionSecret || sessionSecret.length < 32)) {
  throw new Error('SESSION_SECRET (at least 32 characters) is required in production');
}
if (isProduction && allowedOrigins.length === 0) {
  throw new Error('FRONTEND_ORIGIN is required in production');
}

const usersFile = path.resolve(process.env.USERS_FILE || path.join(__dirname, '../../data/users.json'));
const sessionsDir = path.resolve(
  process.env.SESSIONS_DIR || path.join(path.dirname(usersFile), 'sessions'),
);

// The static site and API on *.onrender.com are different sites, so the
// cookie must be SameSite=None (+Secure) there. If both live on one site
// (e.g. app.example.com + api.example.com) set COOKIE_SAMESITE=lax.
const sameSite = (process.env.COOKIE_SAMESITE || (isProduction ? 'none' : 'lax')).toLowerCase();
if (!['none', 'lax', 'strict'].includes(sameSite)) throw new Error('Invalid COOKIE_SAMESITE');

module.exports = {
  isProduction,
  allowedOrigins,
  // Dev-only fallback so the app starts without setup; never used in production.
  sessionSecret: sessionSecret || 'dev-only-insecure-secret-change-me',
  usersFile,
  sessionsDir,
  sameSite,
  sessionMaxAgeMs: 1000 * 60 * 60 * 24 * 7,
};
