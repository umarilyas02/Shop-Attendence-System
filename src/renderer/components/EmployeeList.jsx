import React, { useState, useEffect } from 'react';

// Reusable employee management component: list, add, edit, remove (soft-delete).
export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [error, setError] = useState('');

  async function refresh() {
    const list = await window.api.employees.list({ includeInactive: showInactive });
    setEmployees(list);
  }

  useEffect(() => {
    refresh();
  }, [showInactive]);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    if (!newName.trim()) {
      setError('Employee name is required.');
      return;
    }
    const result = await window.api.employees.add(newName, newRole);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setNewName('');
    setNewRole('');
    refresh();
  }

  function startEdit(emp) {
    setEditingId(emp.id);
    setEditName(emp.full_name);
    setEditRole(emp.role || '');
  }

  async function saveEdit(id) {
    await window.api.employees.update(id, editName, editRole);
    setEditingId(null);
    refresh();
  }

  async function handleRemove(id) {
    await window.api.employees.remove(id);
    refresh();
  }

  async function handleReactivate(id) {
    await window.api.employees.reactivate(id);
    refresh();
  }

  return (
    <div className="panel">
      <h2>Employees</h2>

      <form className="inline-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Employee name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Role (optional)"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
        />
        <button type="submit">Add Employee</button>
      </form>
      {error && <div className="error-message">{error}</div>}

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={showInactive}
          onChange={(e) => setShowInactive(e.target.checked)}
        />
        Show removed employees
      </label>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              {editingId === emp.id ? (
                <>
                  <td>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </td>
                  <td>
                    <input value={editRole} onChange={(e) => setEditRole(e.target.value)} />
                  </td>
                  <td>{emp.is_active ? 'Active' : 'Removed'}</td>
                  <td>
                    <button onClick={() => saveEdit(emp.id)}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{emp.full_name}</td>
                  <td>{emp.role || '-'}</td>
                  <td>{emp.is_active ? 'Active' : 'Removed'}</td>
                  <td>
                    <button onClick={() => startEdit(emp)}>Edit</button>
                    {emp.is_active ? (
                      <button className="danger" onClick={() => handleRemove(emp.id)}>
                        Remove
                      </button>
                    ) : (
                      <button onClick={() => handleReactivate(emp.id)}>Restore</button>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
          {employees.length === 0 && (
            <tr>
              <td colSpan="4" className="empty-state">
                No employees yet. Add one above.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
