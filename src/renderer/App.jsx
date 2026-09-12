import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import EmployeeList from './components/EmployeeList';
import CheckInForm from './components/CheckInForm';
import AttendanceLog from './components/AttendanceLog';
import LeaveManager from './components/LeaveManager';
import Settings from './components/Settings';

export default function App() {
  const [ownerName, setOwnerName] = useState(null); // null = not logged in
  const [activeView, setActiveView] = useState('checkin');
  const [logRefreshKey, setLogRefreshKey] = useState(0);
  const [shopName, setShopName] = useState('');

  function refreshShopName() {
    window.api.settings.get().then((s) => setShopName(s.shop_name || ''));
  }

  useEffect(() => {
    if (ownerName) refreshShopName();
  }, [ownerName]);

  if (!ownerName) {
    return <LoginScreen onLoginSuccess={setOwnerName} />;
  }

  function handleLogout() {
    setOwnerName(null);
    setActiveView('checkin');
  }

  function handleCheckInLogged() {
    // bump the key so AttendanceLog refetches if the owner switches to it
    setLogRefreshKey((k) => k + 1);
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        onLogout={handleLogout}
        ownerName={ownerName}
        shopName={shopName}
      />
      <main className="main-content">
        {activeView === 'checkin' && <CheckInForm onCheckInLogged={handleCheckInLogged} />}
        {activeView === 'employees' && <EmployeeList />}
        {activeView === 'log' && <AttendanceLog refreshKey={logRefreshKey} />}
        {activeView === 'leave' && <LeaveManager />}
        {activeView === 'settings' && <Settings onSettingsSaved={refreshShopName} />}
      </main>
    </div>
  );
}
