const { getDb } = require('./database');

// Shop identity + daily opening time (single row, like the owner table).
function getSettings() {
  const db = getDb();
  const row = db
    .prepare('SELECT shop_name, opening_time FROM shop_settings WHERE id = 1')
    .get();
  return row || { shop_name: null, opening_time: null };
}

function updateSettings(shopName, openingTime) {
  const db = getDb();
  db.prepare(
    `INSERT INTO shop_settings (id, shop_name, opening_time, updated_at)
     VALUES (1, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       shop_name = excluded.shop_name,
       opening_time = excluded.opening_time,
       updated_at = excluded.updated_at`
  ).run(shopName && shopName.trim() ? shopName.trim() : null, openingTime || null);
  return { success: true };
}

module.exports = { getSettings, updateSettings };
