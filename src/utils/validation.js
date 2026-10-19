const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function validateEmail(email) {
  return email.length > 0 && email.length <= 254 && EMAIL_RE.test(email);
}

// Length limit caps Argon2 work; no composition rules (NIST guidance).
function validatePassword(password) {
  if (typeof password !== 'string') return 'Password is required';
  if (password.length < 10) return 'Password must be at least 10 characters';
  if (password.length > 128) return 'Password must be at most 128 characters';
  return null;
}

module.exports = { normalizeEmail, validateEmail, validatePassword };
