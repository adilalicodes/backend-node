const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

// Write to a temp file in the same directory, fsync, then rename over the
// target. rename() is atomic on the same filesystem, so readers/crashes see
// either the old or the new file, never a partial one.
async function writeJsonAtomic(file, data) {
  const dir = path.dirname(file);
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  const tmp = path.join(dir, `.${path.basename(file)}.${crypto.randomBytes(6).toString('hex')}.tmp`);
  const handle = await fs.open(tmp, 'w', 0o600);
  try {
    await handle.writeFile(JSON.stringify(data, null, 2));
    await handle.sync();
  } finally {
    await handle.close();
  }
  try {
    await fs.rename(tmp, file);
  } catch (err) {
    await fs.rm(tmp, { force: true });
    throw err;
  }
}

module.exports = { readJson, writeJsonAtomic };
