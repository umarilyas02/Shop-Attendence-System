const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

const { initDatabase } = require('./database');
const auth = require('./auth');
const employees = require('./employees');
const attendance = require('./attendance');
const settings = require('./settings');
const leaves = require('./leaves');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // renderer cannot touch Node/main directly - only via preload bridge
      nodeIntegration: false,
    },
    // No default menu bar - this is a locked-down single-purpose kiosk-style app
    autoHideMenuBar: true,
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
}

// Startup failures (e.g. a missing/corrupt schema file, a native module
// mismatch) must never fail silently - without this the process would sit
// in Task Manager with no window and no visible error.
function fatalStartupError(error) {
  console.error('Fatal startup error:', error);
  dialog.showErrorBox(
    'Shop Attendance failed to start',
    `The application could not start:\n\n${error.message}`
  );
  app.exit(1);
}

app.whenReady().then(() => {
  try {
    initDatabase();
    createWindow();
  } catch (error) {
    fatalStartupError(error);
    return;
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch(fatalStartupError);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ---- IPC handlers: renderer calls these via window.api.* (see preload.js) ----

ipcMain.handle('auth:hasOwnerAccount', () => auth.hasOwnerAccount());
ipcMain.handle('auth:createOwnerAccount', (_e, { username, password }) =>
  auth.createOwnerAccount(username, password)
);
ipcMain.handle('auth:login', (_e, { username, password }) =>
  auth.verifyLogin(username, password)
);
ipcMain.handle('auth:changePassword', (_e, { username, currentPassword, newPassword }) =>
  auth.changePassword(username, currentPassword, newPassword)
);

ipcMain.handle('employees:list', (_e, opts) => employees.listEmployees(opts));
ipcMain.handle('employees:add', (_e, { fullName, role }) =>
  employees.addEmployee(fullName, role)
);
ipcMain.handle('employees:update', (_e, { id, fullName, role }) =>
  employees.updateEmployee(id, fullName, role)
);
ipcMain.handle('employees:remove', (_e, { id }) => employees.removeEmployee(id));
ipcMain.handle('employees:reactivate', (_e, { id }) => employees.reactivateEmployee(id));

ipcMain.handle('attendance:add', (_e, { employeeId, checkInTime, note }) =>
  attendance.addCheckIn(employeeId, checkInTime, note)
);
ipcMain.handle('attendance:list', (_e, filters) => attendance.listAttendance(filters));
ipcMain.handle('attendance:delete', (_e, { id }) => attendance.deleteAttendance(id));
ipcMain.handle('attendance:update', (_e, { id, checkInTime, note }) =>
  attendance.updateAttendance(id, checkInTime, note)
);

ipcMain.handle('settings:get', () => settings.getSettings());
ipcMain.handle('settings:update', (_e, { shopName, openingTime }) =>
  settings.updateSettings(shopName, openingTime)
);

ipcMain.handle('leaves:add', (_e, { employeeId, leaveDate, reason }) =>
  leaves.addLeave(employeeId, leaveDate, reason)
);
ipcMain.handle('leaves:list', (_e, filters) => leaves.listLeaves(filters));
ipcMain.handle('leaves:delete', (_e, { id }) => leaves.deleteLeave(id));
