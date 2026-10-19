const crypto = require('crypto');
const { usersFile, isProduction } = require('../config');
const { hashPassword } = require('../utils/password');
const { readJson, writeJsonAtomic } = require('./jsonFile');

// All reads and writes go through one promise chain, so concurrent requests
// are serialized (no lost updates, no duplicate emails from races).
let queue = Promise.resolve();
function serialize(task) {
  const run = queue.then(task, task);
  queue = run.catch(() => {});
  return run;
}

async function load() {
  const data = await readJson(usersFile, { users: [] });
  if (!data || !Array.isArray(data.users)) throw new Error('users file is malformed');
  return data;
}

const DEMO_EMAIL = 'demo@example.com';

// Ensure the file exists on startup and contains the dummy demo user.
// Password: SEED_DEMO_PASSWORD, or "demo-password-123" outside production.
// In production the demo user is only seeded if SEED_DEMO_PASSWORD is set,
// so a publicly known password is never created there by accident.
function init() {
  return serialize(async () => {
    const data = await load();
    const demoPassword = process.env.SEED_DEMO_PASSWORD || (isProduction ? '' : 'demo-password-123');
    if (demoPassword && !data.users.some((u) => u.email === DEMO_EMAIL)) {
      data.users.push({
        id: crypto.randomUUID(),
        email: DEMO_EMAIL,
        passwordHash: await hashPassword(demoPassword),
        createdAt: new Date().toISOString(),
      });
    }
    await writeJsonAtomic(usersFile, data);
  });
}

function findByEmail(email) {
  return serialize(async () => (await load()).users.find((u) => u.email === email) || null);
}

function findById(id) {
  return serialize(async () => (await load()).users.find((u) => u.id === id) || null);
}

// Returns the new user, or null if the email is already taken.
function create({ email, passwordHash }) {
  return serialize(async () => {
    const data = await load();
    if (data.users.some((u) => u.email === email)) return null;
    const user = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    data.users.push(user);
    await writeJsonAtomic(usersFile, data);
    return user;
  });
}

module.exports = { init, findByEmail, findById, create };
