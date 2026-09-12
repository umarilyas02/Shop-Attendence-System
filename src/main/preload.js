const { contextBridge, ipcRenderer } = require('electron');

// This is the ONLY bridge between the React UI (renderer) and Node/DB (main).
// The renderer never gets raw Node or filesystem access - just these
// specific, named functions. This is the standard secure Electron pattern.
contextBridge.exposeInMainWorld('api', {
  auth: {
    hasOwnerAccount: () => ipcRenderer.invoke('auth:hasOwnerAccount'),
    createOwnerAccount: (username, password) =>
      ipcRenderer.invoke('auth:createOwnerAccount', { username, password }),
    login: (username, password) => ipcRenderer.invoke('auth:login', { username, password }),
    changePassword: (username, currentPassword, newPassword) =>
      ipcRenderer.invoke('auth:changePassword', { username, currentPassword, newPassword }),
  },
  employees: {
    list: (opts) => ipcRenderer.invoke('employees:list', opts),
    add: (fullName, role) => ipcRenderer.invoke('employees:add', { fullName, role }),
    update: (id, fullName, role) =>
      ipcRenderer.invoke('employees:update', { id, fullName, role }),
    remove: (id) => ipcRenderer.invoke('employees:remove', { id }),
    reactivate: (id) => ipcRenderer.invoke('employees:reactivate', { id }),
  },
  attendance: {
    add: (employeeId, checkInTime, note) =>
      ipcRenderer.invoke('attendance:add', { employeeId, checkInTime, note }),
    list: (filters) => ipcRenderer.invoke('attendance:list', filters),
    delete: (id) => ipcRenderer.invoke('attendance:delete', { id }),
    update: (id, checkInTime, note) =>
      ipcRenderer.invoke('attendance:update', { id, checkInTime, note }),
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (shopName, openingTime) =>
      ipcRenderer.invoke('settings:update', { shopName, openingTime }),
  },
  leaves: {
    add: (employeeId, leaveDate, reason) =>
      ipcRenderer.invoke('leaves:add', { employeeId, leaveDate, reason }),
    list: (filters) => ipcRenderer.invoke('leaves:list', filters),
    delete: (id) => ipcRenderer.invoke('leaves:delete', { id }),
  },
});
