import React, { useState, useEffect } from 'react';

function todayAsDateInput() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function formatDisplayDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString();
}

// Mark an employee as on leave/absent for a full day, separate from the
// daily check-in attendance log.
export default function LeaveManager() {
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [leaveDate, setLeaveDate] = useState(todayAsDateInput());
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  async function refreshEmployees() {
    const list = await window.api.employees.list({ includeInactive: false });
    setEmployees(list);
    if (list.length > 0 && !selectedId) setSelectedId(String(list[0].id));
  }

  async function refreshLeaves() {
    const filters = {};
    if (filterEmployee) filters.employeeId = Number(filterEmployee);
    if (filterFrom) filters.fromDate = filterFrom;
    if (filterTo) filters.toDate = filterTo;
    const list = await window.api.leaves.list(filters);
    setRecords(list);
  }

  useEffect(() => {
    refreshEmployees();
  }, []);

  useEffect(() => {
    refreshLeaves();
  }, [filterEmployee, filterFrom, filterTo]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedId) {
      setError('Please select an employee.');
      return;
    }
    if (!leaveDate) {
      setError('Please choose a leave date.');
      return;
    }

    const result = await window.api.leaves.add(Number(selectedId), leaveDate, reason);
    if (!result.success) {
      setError(result.error);
      return;
    }

    const empName = employees.find((emp) => emp.id === Number(selectedId))?.full_name;
    setSuccess(`Leave recorded: ${empName}`);
    setReason('');
    refreshLeaves();
  }

  async function handleDelete(id) {
    await window.api.leaves.delete(id);
    refreshLeaves();
  }

  return (
    <div className="panel">
      <h2>Employee Leave</h2>

      {employees.length === 0 ? (
        <p className="empty-state">Add an employee first before recording leave.</p>
      ) : (
        <form className="checkin-form" onSubmit={handleSubmit}>
          <label>
            Employee
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name}
                  {emp.role ? ` (${emp.role})` : ''}
                </option>
              ))}
            </select>
          </label>

          <label>
            Leave Date
            <input
              type="date"
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
            />
          </label>

          <label>
            Reason (optional)
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. sick, vacation"
            />
          </label>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit">Record Leave</button>
        </form>
      )}

      <h3>Leave History</h3>

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
            <th>Date</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => (
            <tr key={rec.id}>
              <td>{rec.full_name}</td>
              <td>{formatDisplayDate(rec.leave_date)}</td>
              <td>{rec.reason || '-'}</td>
              <td>
                <button className="danger" onClick={() => handleDelete(rec.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {records.length === 0 && (
            <tr>
              <td colSpan="4" className="empty-state">
                No leave recorded.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
