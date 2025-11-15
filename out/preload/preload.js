"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  // --- Window Controls (Unchanged) ---
  closeWindow: () => ipcRenderer.send("close-window"),
  minimizeWindow: () => ipcRenderer.send("minimize-window"),
  maximizeWindow: () => ipcRenderer.send("maximize-window"),
  // --- UPDATED Notes Functions for Tree Structure ---
  getNotesList: () => ipcRenderer.invoke("get-notes-list"),
  // Fetches the nested tree
  getNoteContent: (notePath) => ipcRenderer.invoke("get-note-content", notePath),
  // Uses path
  saveNoteContent: (note) => ipcRenderer.invoke("save-note-content", note),
  // Note object: { id, path, content }
  // ⬇️ --- FIX 1 --- Changed 'send' to 'invoke'
  updateNoteTitle: (item) => ipcRenderer.invoke("update-note-title", item),
  // Item object: { id, path, newTitle, type }
  createNote: (parentPath, noteName) => ipcRenderer.invoke("create-note", parentPath, noteName),
  // Added parentPath
  deleteNote: (itemPath, type) => ipcRenderer.invoke("delete-note", itemPath, type),
  // Uses path and type
  createFolder: (parentPath, folderName) => ipcRenderer.on("create-folder", parentPath, folderName),
  // --- Reminders Functions (Unchanged) ---
  loadReminders: () => ipcRenderer.invoke("load-reminders"),
  saveReminders: (reminders) => ipcRenderer.send("save-reminders", reminders),
  showNotification: (title, desc) => ipcRenderer.send("show-notification", title, desc)
});
