const bcrypt = require('bcryptjs');
const { getDb } = require('./database');

// Whether an owner account has already been created (first-run setup vs login screen)
function hasOwnerAccount() {
  const db = getDb();
  const row = db.prepare('SELECT id FROM owner WHERE id = 1').get();
  return !!row;
}

// First-run: owner sets their own username/password
function createOwnerAccount(username, password) {
  if (!username || !password) {
    return { success: false, error: 'Username and password are required.' };
  }
  if (password.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters.' };
  }
  const db = getDb();
  const hash = bcrypt.hashSync(password, 10);
  try {
    db.prepare(
      'INSERT INTO owner (id, username, password_hash) VALUES (1, ?, ?)'
    ).run(username, hash);
    return { success: true };
  } catch (err) {
    return { success: false, error: 'An owner account already exists.' };
  }
}

function verifyLogin(username, password) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM owner WHERE username = ?').get(username);
  if (!row) {
    return { success: false, error: 'Invalid username or password.' };
  }
  const match = bcrypt.compareSync(password, row.password_hash);
  if (!match) {
    return { success: false, error: 'Invalid username or password.' };
  }
  return { success: true };
}

// Let the owner change their password from within the app
function changePassword(username, currentPassword, newPassword) {
  const check = verifyLogin(username, currentPassword);
  if (!check.success) {
    return { success: false, error: 'Current password is incorrect.' };
  }
  if (!newPassword || newPassword.length < 4) {
    return { success: false, error: 'New password must be at least 4 characters.' };
  }
  const db = getDb();
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE owner SET password_hash = ? WHERE username = ?').run(hash, username);
  return { success: true };
}

module.exports = { hasOwnerAccount, createOwnerAccount, verifyLogin, changePassword };
