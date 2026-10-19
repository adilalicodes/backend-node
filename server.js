const app = require('./app');
const userStore = require('./db/userStore');

const PORT = process.env.PORT || 3000;

userStore
  .init()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API listening on 0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize user store:', err);
    process.exit(1);
  });
