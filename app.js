const fs = require('fs');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const config = require('./src/config');
const originCheck = require('./src/middleware/originCheck');
const notFound = require('./src/middleware/notFound');
const errorHandler = require('./src/middleware/errorHandler');
const authRoutes = require('./src/modules/auth/auth.routes');

const app = express();

// Render terminates TLS at a proxy; trust it so secure cookies and client IPs ff
// (for rate limiting) work.
if (config.isProduction) app.set('trust proxy', 1);

app.use(cors({ origin: config.allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10kb' }));

fs.mkdirSync(config.sessionsDir, { recursive: true, mode: 0o700 });
app.use(
  session({
    name: 'sid',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new FileStore({
      path: config.sessionsDir,
      ttl: config.sessionMaxAgeMs / 1000,
      retries: 1,
      logFn: () => {},
    }),
    cookie: {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: config.sameSite,
      maxAge: config.sessionMaxAgeMs,
    },
  }),
);

app.get('/', (req, res) => {
  res.json({ message: 'myStorage API' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', originCheck, authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
