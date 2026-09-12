const { getDb } = require('./database');

// Owner logs a check-in for an employee at a time of their choosing
// (can be "now" or backdated/adjusted - no restriction, per shop owner's workflow)
function addCheckIn(employeeId, checkInTime, note) {
  if (!employeeId || !checkInTime) {
    return { success: false, error: 'Employee and check-in time are required.' };
  }
  const db = getDb();
  const result = db
    .prepare(
      'INSERT INTO attendance (employee_id, check_in_time, note) VALUES (?, ?, ?)'
    )
    .run(employeeId, checkInTime, note ? note.trim() : null);
  return { success: true, id: result.lastInsertRowid };
}

// Fetch attendance log, optionally filtered by employee and/or date range.
// Dates are expected as ISO strings (YYYY-MM-DD or full datetime).
function listAttendance({ employeeId = null, fromDate = null, toDate = null } = {}) {
  const db = getDb();
  let query = `
    SELECT a.id, a.employee_id, a.check_in_time, a.note, e.full_name, e.role
    FROM attendance a
    JOIN employees e ON e.id = a.employee_id
    WHERE 1 = 1
  `;
  const params = [];

  if (employeeId) {
    query += ' AND a.employee_id = ?';
    params.push(employeeId);
  }
  if (fromDate) {
    query += ' AND a.check_in_time >= ?';
    params.push(fromDate);
  }
  if (toDate) {
    query += ' AND a.check_in_time <= ?';
    params.push(toDate);
  }
  query += ' ORDER BY a.check_in_time DESC';

  return db.prepare(query).all(...params);
}

function deleteAttendance(id) {
  const db = getDb();
  db.prepare('DELETE FROM attendance WHERE id = ?').run(id);
  return { success: true };
}

function updateAttendance(id, checkInTime, note) {
  const db = getDb();
  db.prepare('UPDATE attendance SET check_in_time = ?, note = ? WHERE id = ?').run(
    checkInTime,
    note ? note.trim() : null,
    id
  );
  return { success: true };
}

module.exports = { addCheckIn, listAttendance, deleteAttendance, updateAttendance };
