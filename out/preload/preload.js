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
  createCanvas: (parentPath, canvasName) => ipcRenderer.invoke("create-canvas", parentPath, canvasName),
  // --- NEW Folder Function (FIXED) ---
  // 💡 FIX 1: Changed to ipcRenderer.invoke() to enable Promise handling in App.jsx.
  // 💡 FIX 2: Changed channel name to 'fs:create-folder' to match main.js.
  createFolder: (parentPath, folderName) => ipcRenderer.invoke("fs:create-folder", parentPath, folderName),
  // --- Reminders Functions (Unchanged) ---
  loadReminders: () => ipcRenderer.invoke("load-reminders"),
  saveReminders: (reminders) => ipcRenderer.send("save-reminders", reminders),
  showNotification: (title, desc) => ipcRenderer.send("show-notification", title, desc)
});
