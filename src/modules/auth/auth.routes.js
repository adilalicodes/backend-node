const express = require('express');
const rateLimit = require('express-rate-limit');
const userStore = require('../../db/userStore');
const { hashPassword, verifyPassword, dummyHashPromise } = require('../../utils/password');
const { normalizeEmail, validateEmail, validatePassword } = require('../../utils/validation');
const requireAuth = require('../../middleware/requireAuth');
const { isProduction, sameSite } = require('../../config');

const router = express.Router();

const limiter = (max, message) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message },
  });

const loginLimiter = limiter(10, 'Too many attempts. Try again later.');
const registerLimiter = limiter(10, 'Too many attempts. Try again later.');

const publicUser = (u) => ({ id: u.id, email: u.email, createdAt: u.createdAt });

// New session id on privilege change prevents session fixation.
const startSession = (req, userId) =>
  new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.userId = userId;
      req.session.save((err2) => (err2 ? reject(err2) : resolve()));
    });
  });

router.post('/register', registerLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;

  if (!validateEmail(email)) return res.status(400).json({ error: 'Enter a valid email address' });
  const pwError = validatePassword(password);
  if (pwError) return res.status(400).json({ error: pwError });

  const user = await userStore.create({ email, passwordHash: await hashPassword(password) });
  if (!user) return res.status(409).json({ error: 'An account with this email already exists' });

  await startSession(req, user.id);
  res.status(201).json({ user: publicUser(user) });
});

router.post('/login', loginLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;
  const generic = { error: 'Invalid email or password' };

  if (!validateEmail(email) || typeof password !== 'string' || password.length > 128) {
    return res.status(401).json(generic);
  }

  const user = await userStore.findByEmail(email);
  const ok = await verifyPassword(user ? user.passwordHash : await dummyHashPromise, password);
  if (!user || !ok) return res.status(401).json(generic);

  await startSession(req, user.id);
  res.json({ user: publicUser(user) });
});

router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('sid', { httpOnly: true, secure: isProduction, sameSite });
    res.json({ ok: true });
  });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await userStore.findById(req.session.userId);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ user: publicUser(user) });
});

module.exports = router;
