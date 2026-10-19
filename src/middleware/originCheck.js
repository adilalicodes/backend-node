const { allowedOrigins } = require('../config');

// CSRF defense for cookie auth: state-changing requests must come from the
// configured frontend origin (browsers always send Origin on cross-origin POST).
function originCheck(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (!origin || !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden origin' });
  }
  next();
}

module.exports = originCheck;
