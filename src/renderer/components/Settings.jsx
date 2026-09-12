import React, { useState, useEffect } from 'react';

// Shop identity + daily opening time. The opening time is what the
// Attendance Log uses to work out how late a check-in was.
export default function Settings({ onSettingsSaved }) {
  const [shopName, setShopName] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    window.api.settings.get().then((s) => {
      setShopName(s.shop_name || '');
      setOpeningTime(s.opening_time || '');
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess('');
    await window.api.settings.update(shopName, openingTime);
    setSuccess('Settings saved.');
    if (onSettingsSaved) onSettingsSaved();
  }

  return (
    <div className="panel">
      <h2>Shop Settings</h2>

      <form className="checkin-form" onSubmit={handleSubmit}>
        <label>
          Shop Name
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="e.g. Main Street Store"
          />
        </label>

        <label>
          Opening Time
          <input
            type="time"
            value={openingTime}
            onChange={(e) => setOpeningTime(e.target.value)}
          />
        </label>
        <p className="hint-text">
          Used to work out how late an employee's check-in was in the Attendance Log.
        </p>

        {success && <div className="success-message">{success}</div>}

        <button type="submit">Save Settings</button>
      </form>
    </div>
  );
}
