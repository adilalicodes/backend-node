const argon2 = require('argon2');

const OPTIONS = { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 };

const hashPassword = (password) => argon2.hash(password, OPTIONS);

async function verifyPassword(hash, password) {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

// Verified against when the email is unknown, so response time doesn't reveal
// whether an account exists.
const dummyHashPromise = hashPassword('dummy-password-for-timing');

module.exports = { hashPassword, verifyPassword, dummyHashPromise };
