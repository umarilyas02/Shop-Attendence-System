-- 002-add-settings-and-leaves.sql
-- Adds shop settings (name + daily opening time, used to compute how late
-- a check-in was) and a separate employee leave/absence tracker.

CREATE TABLE IF NOT EXISTS shop_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1), -- enforce single-row table
    shop_name TEXT,
    opening_time TEXT, -- "HH:MM" 24-hour, shop's daily opening time
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Full-day leave/absence records, separate from daily check-in attendance.
CREATE TABLE IF NOT EXISTS leaves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    leave_date TEXT NOT NULL, -- "YYYY-MM-DD"
    reason TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    UNIQUE (employee_id, leave_date)
);

CREATE INDEX IF NOT EXISTS idx_leaves_employee ON leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_date ON leaves(leave_date);
