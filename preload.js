const { contextBridge, ipcRenderer } = require('electron');

// Securely expose a global API to your renderer process (the UI)
contextBridge.exposeInMainWorld('electronAPI', {
  // --- Window Controls (Unchanged) ---
  closeWindow: () => ipcRenderer.send('close-window'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),

  // --- UPDATED Notes Functions for Tree Structure ---
  getNotesList: () => ipcRenderer.invoke('get-notes-list'), // Fetches the nested tree
  getNoteContent: (notePath) => ipcRenderer.invoke('get-note-content', notePath), // Uses path
  saveNoteContent: (note) => ipcRenderer.send('save-note-content', note), // Note object: { id, path, content }
  updateNoteTitle: (item) => ipcRenderer.send('update-note-title', item), // Item object: { id, path, newTitle, type }
  createNote: (parentPath) => ipcRenderer.invoke('create-note', parentPath), // Added parentPath
  deleteNote: (itemPath, type) => ipcRenderer.send('delete-note', itemPath, type), // Uses path and type

  // --- NEW Folder Function ---
  createFolder: (parentPath, folderName) => ipcRenderer.send('create-folder', parentPath, folderName),

  // --- Reminders Functions (Unchanged) ---
  loadReminders: () => ipcRenderer.invoke('load-reminders'),
  saveReminders: (reminders) => ipcRenderer.send('save-reminders', reminders),
  showNotification: (title, desc) => ipcRenderer.send('show-notification', title, desc)
});