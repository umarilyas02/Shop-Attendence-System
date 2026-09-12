import React, { useState, useEffect } from 'react';

function nowAsDatetimeLocal() {
  const d = new Date();
  d.setSeconds(0, 0);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm" for <input type="datetime-local">
}

// Reusable check-in logging component. Owner picks an employee and a
// time (defaults to now, but can be changed/backdated), then logs it.
// There is deliberately no checkout flow, per the shop owner's workflow.
export default function CheckInForm({ onCheckInLogged }) {
  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [checkInTime, setCheckInTime] = useState(nowAsDatetimeLocal());
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    window.api.employees.list({ includeInactive: false }).then((list) => {
      setEmployees(list);
      if (list.length > 0) setSelectedId(String(list[0].id));
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedId) {
      setError('Please select an employee.');
      return;
    }
    if (!checkInTime) {
      setError('Please choose a check-in time.');
      return;
    }

    const isoTime = new Date(checkInTime).toISOString();
    const result = await window.api.attendance.add(Number(selectedId), isoTime, note);
    if (!result.success) {
      setError(result.error);
      return;
    }

    const empName = employees.find((emp) => emp.id === Number(selectedId))?.full_name;
    setSuccess(`Checked in: ${empName}`);
    setNote('');
    setCheckInTime(nowAsDatetimeLocal());
    if (onCheckInLogged) onCheckInLogged();
  }

  return (
    <div className="panel">
      <h2>Log a Check-In</h2>

      {employees.length === 0 ? (
        <p className="empty-state">Add an employee first before logging check-ins.</p>
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
            Check-In Time
            <input
              type="datetime-local"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
            />
          </label>

          <label>
            Note (optional)
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. late arrival, half day"
            />
          </label>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit">Log Check-In</button>
        </form>
      )}
    </div>
  );
}
