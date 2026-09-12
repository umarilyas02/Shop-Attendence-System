const { getDb } = require('./database');

// Owner marks an employee as on leave/absent for a full day
// (separate from the daily check-in attendance log).
function addLeave(employeeId, leaveDate, reason) {
  if (!employeeId || !leaveDate) {
    return { success: false, error: 'Employee and leave date are required.' };
  }
  const db = getDb();
  try {
    const result = db
      .prepare('INSERT INTO leaves (employee_id, leave_date, reason) VALUES (?, ?, ?)')
      .run(employeeId, leaveDate, reason ? reason.trim() : null);
    return { success: true, id: result.lastInsertRowid };
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return { success: false, error: 'Leave already recorded for this employee on this date.' };
    }
    throw err;
  }
}

// Fetch leave records, optionally filtered by employee and/or date range.
function listLeaves({ employeeId = null, fromDate = null, toDate = null } = {}) {
  const db = getDb();
  let query = `
    SELECT l.id, l.employee_id, l.leave_date, l.reason, e.full_name, e.role
    FROM leaves l
    JOIN employees e ON e.id = l.employee_id
    WHERE 1 = 1
  `;
  const params = [];

  if (employeeId) {
    query += ' AND l.employee_id = ?';
    params.push(employeeId);
  }
  if (fromDate) {
    query += ' AND l.leave_date >= ?';
    params.push(fromDate);
  }
  if (toDate) {
    query += ' AND l.leave_date <= ?';
    params.push(toDate);
  }
  query += ' ORDER BY l.leave_date DESC';

  return db.prepare(query).all(...params);
}

function deleteLeave(id) {
  const db = getDb();
  db.prepare('DELETE FROM leaves WHERE id = ?').run(id);
  return { success: true };
}

module.exports = { addLeave, listLeaves, deleteLeave };
