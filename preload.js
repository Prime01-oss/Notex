const { contextBridge, ipcRenderer } = require('electron');

// Securely expose a global API to your renderer process (the UI)
contextBridge.exposeInMainWorld('electronAPI', {
  // --- Window Controls (Unchanged) ---
  closeWindow: () => ipcRenderer.send('close-window'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),

  // --- UPDATED Notes Functions ---
  getNotesList: () => ipcRenderer.invoke('get-notes-list'),
  getNoteContent: (noteId) => ipcRenderer.invoke('get-note-content', noteId),
  saveNoteContent: (note) => ipcRenderer.send('save-note-content', note),
  updateNoteTitle: (note) => ipcRenderer.send('update-note-title', note),
  createNote: () => ipcRenderer.invoke('create-note'),
  deleteNote: (noteId) => ipcRenderer.send('delete-note', noteId),

  // --- Reminders Functions (Unchanged) ---
  loadReminders: () => ipcRenderer.invoke('load-reminders'),
  saveReminders: (reminders) => ipcRenderer.send('save-reminders', reminders),
  showNotification: (title, desc) => ipcRenderer.send('show-notification', title, desc)
});