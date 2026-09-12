-- initial-schema.sql
-- Shop Attendance System - Baseline Schema
-- Created: Initial version
-- Engine: SQLite

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
