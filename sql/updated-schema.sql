-- updated-schema.sql
-- Shop Attendance System - CURRENT/LIVE schema (always reflects latest state)
-- This file is updated every time a migration file changes the schema.
-- See individual migration files in /sql for change history.
-- Engine: SQLite
--
-- CHANGE LOG:
-- 002-add-settings-and-leaves.sql: added shop_settings (shop name + daily
--   opening time, for computing lateness) and leaves (employee leave/absence
--   days, separate from daily attendance check-ins)

-- Single shop owner account (auth-gated access to the whole app)
CREATE TABLE IF NOT EXISTS owner (
    id INTEGER PRIMARY KEY CHECK (id = 1), -- enforce single-row table
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Employees the owner manages (add/remove/edit)
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    role TEXT,
    is_active INTEGER NOT NULL DEFAULT 1, -- 1 = active, 0 = removed/archived
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Attendance check-ins logged by the owner on employees' behalf
-- No checkout column by design: check-in only system
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    check_in_time TEXT NOT NULL, -- ISO datetime string, owner-selectable (can backdate/adjust)
    note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_checkin_time ON attendance(check_in_time);

-- Shop identity + daily opening time, used to compute how late a check-in was.
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
