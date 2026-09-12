import React, { useState, useEffect } from 'react';

function formatDisplayTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString();
}

// Compares a check-in against the shop's daily opening time and returns
// how late it was, or null if there's no opening time configured yet.
function computeLateness(checkInIso, openingTime) {
  if (!openingTime) return null;
  const [openHour, openMinute] = openingTime.split(':').map(Number);
  const checkIn = new Date(checkInIso);
  const expectedOpen = new Date(checkIn);
  expectedOpen.setHours(openHour, openMinute, 0, 0);

  const diffMinutes = Math.round((checkIn - expectedOpen) / 60000);
  if (diffMinutes <= 0) return { onTime: true };
  return { onTime: false, hours: Math.floor(diffMinutes / 60), minutes: diffMinutes % 60 };
}

function formatLateness(lateness) {
  if (!lateness) return '-';
  if (lateness.onTime) return 'On time';
  const parts = [];
  if (lateness.hours > 0) parts.push(`${lateness.hours}h`);
  if (lateness.minutes > 0 || lateness.hours === 0) parts.push(`${lateness.minutes}m`);
  return `${parts.join(' ')} late`;
}

// Reusable attendance history viewer with employee/date filters and
// inline edit/delete for correcting mistaken entries.
export default function AttendanceLog({ refreshKey }) {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [openingTime, setOpeningTime] = useState(null);
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  async function refresh() {
    const filters = {};
    if (filterEmployee) filters.employeeId = Number(filterEmployee);
    if (filterFrom) filters.fromDate = new Date(filterFrom).toISOString();
    if (filterTo) filters.toDate = new Date(filterTo).toISOString();

    const list = await window.api.attendance.list(filters);
    setRecords(list);
  }

  useEffect(() => {
    window.api.employees.list({ includeInactive: true }).then(setEmployees);
    window.api.settings.get().then((s) => setOpeningTime(s.opening_time));
  }, []);

  useEffect(() => {
    refresh();
  }, [filterEmployee, filterFrom, filterTo, refreshKey]);

  async function handleDelete(id) {
    await window.api.attendance.delete(id);
    refresh();
  }

  return (
    <div className="panel">
      <h2>Attendance Log</h2>

      <div className="filters">
        <label>
          Employee
          <select value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)}>
            <option value="">All employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          From
          <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
        </label>
        <label>
          To
          <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
        </label>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Check-In Time</th>
            <th>Late By</th>
            <th>Note</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => {
            const lateness = computeLateness(rec.check_in_time, openingTime);
            return (
              <tr key={rec.id}>
                <td>{rec.full_name}</td>
                <td>{formatDisplayTime(rec.check_in_time)}</td>
                <td className={lateness && !lateness.onTime ? 'late-cell' : ''}>
                  {formatLateness(lateness)}
                </td>
                <td>{rec.note || '-'}</td>
                <td>
                  <button className="danger" onClick={() => handleDelete(rec.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
          {records.length === 0 && (
            <tr>
              <td colSpan="5" className="empty-state">
                No check-ins found.
              </td>
            </tr>
          )}
          {records.length > 0 && !openingTime && (
            <tr>
              <td colSpan="5" className="empty-state">
                Set the shop's opening time in Settings to see lateness.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
