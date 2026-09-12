import React from 'react';

// Reusable nav shell - used by the main App screen to switch between views.
export default function Sidebar({ activeView, onNavigate, onLogout, ownerName, shopName }) {
  const items = [
    { key: 'checkin', label: 'Check-In' },
    { key: 'employees', label: 'Employees' },
    { key: 'log', label: 'Attendance Log' },
    { key: 'leave', label: 'Leave' },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>{shopName || 'Shop Attendance'}</h2>
        <span className="owner-name">{ownerName}</span>
      </div>

      <nav>
        {items.map((item) => (
          <button
            key={item.key}
            className={activeView === item.key ? 'nav-item active' : 'nav-item'}
            onClick={() => onNavigate(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <button className="logout-btn" onClick={onLogout}>
        Log Out
      </button>
    </aside>
  );
}
