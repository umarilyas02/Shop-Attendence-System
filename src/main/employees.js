const { getDb } = require('./database');

function listEmployees({ includeInactive = false } = {}) {
  const db = getDb();
  if (includeInactive) {
    return db.prepare('SELECT * FROM employees ORDER BY full_name').all();
  }
  return db
    .prepare('SELECT * FROM employees WHERE is_active = 1 ORDER BY full_name')
    .all();
}

function addEmployee(fullName, role) {
  if (!fullName || !fullName.trim()) {
    return { success: false, error: 'Employee name is required.' };
  }
  const db = getDb();
  const result = db
    .prepare('INSERT INTO employees (full_name, role) VALUES (?, ?)')
    .run(fullName.trim(), role ? role.trim() : null);
  return { success: true, id: result.lastInsertRowid };
}

function updateEmployee(id, fullName, role) {
  const db = getDb();
  db.prepare('UPDATE employees SET full_name = ?, role = ? WHERE id = ?').run(
    fullName.trim(),
    role ? role.trim() : null,
    id
  );
  return { success: true };
}

// Soft-delete: keeps historical attendance records intact for that employee.
// This is important — hard-deleting would orphan or destroy attendance history.
function removeEmployee(id) {
  const db = getDb();
  db.prepare('UPDATE employees SET is_active = 0 WHERE id = ?').run(id);
  return { success: true };
}

function reactivateEmployee(id) {
  const db = getDb();
  db.prepare('UPDATE employees SET is_active = 1 WHERE id = ?').run(id);
  return { success: true };
}

module.exports = {
  listEmployees,
  addEmployee,
  updateEmployee,
  removeEmployee,
  reactivateEmployee,
};
