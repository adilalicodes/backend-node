function notFound(req, res, next) {
  const err = new Error(`Not Found: ${req.method} ${req.originalUrl}`);
  err.status = 404;
  next(err);
}

module.exports = notFound;
