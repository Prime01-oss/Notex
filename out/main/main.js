"use strict";
const { app, BrowserWindow, ipcMain, Notification, session } = require("electron");
const path = require("path");
const fs = require("fs").promises;
const crypto = require("node:crypto");
const userDataPath = app.getPath("userData");
const notesDir = path.join(userDataPath, "Notes");
const remindersFilePath = path.join(userDataPath, "reminders.json");
async function ensureNotesDirExists() {
  try {
    await fs.stat(notesDir);
  } catch (err) {
    await fs.mkdir(notesDir);
  }
}
async function scanNotesDir(currentPath, baseDir) {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });
  const tree = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(currentPath, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    if (entry.isDirectory()) {
      const children = await scanNotesDir(fullPath, baseDir);
      tree.push({
        id: relativePath,
        title: entry.name,
        type: "folder",
        path: relativePath,
        children
      });
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      try {
        const fileData = await fs.readFile(fullPath, "utf8");
        const note = JSON.parse(fileData);
        tree.push({
          id: note.id,
          // Keep the UUID as the canonical ID
          title: note.title,
          type: "note",
          path: relativePath
          // Relative path for file operations
        });
      } catch (err) {
        console.error(`Error reading note file ${entry.name} at ${relativePath}:`, err);
      }
    }
  }
  return tree.sort((a, b) => {
    if (a.type === "folder" && b.type !== "folder") return -1;
    if (a.type !== "folder" && b.type === "folder") return 1;
    return a.title.localeCompare(b.title);
  });
}
let mainWindow;
function createWindow() {
  const preloadScript = app.isPackaged ? path.join(__dirname, "../preload/preload.js") : path.join(__dirname, "preload.js");
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 1650,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: preloadScript
    },
    frame: false,
    transparent: true,
    titleBarStyle: "hidden",
    vibrancy: "ultra-dark",
    backgroundColor: "#00000000",
    show: false
  });
  const devServerURL = "http://localhost:5173";
  if (!app.isPackaged) {
    console.log("[DEBUG] Loading Dev Server URL: " + devServerURL);
    mainWindow.loadURL(devServerURL);
  } else {
    console.log("[DEBUG] Loading Production File");
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  ipcMain.on("show-notification", (event, title, description) => {
    const iconPath = app.isPackaged ? path.join(__dirname, "../renderer/notezone.png") : path.join(__dirname, "public/notezone.png");
    const notification = new Notification({
      title,
      body: description,
      icon: iconPath
    });
    notification.show();
  });
  ipcMain.on("close-window", () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });
  ipcMain.on("minimize-window", () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });
  ipcMain.on("maximize-window", () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });
  ipcMain.handle("get-notes-list", async () => {
    await ensureNotesDirExists();
    return scanNotesDir(notesDir, notesDir);
  });
  ipcMain.handle("get-note-content", async (event, notePath) => {
    await ensureNotesDirExists();
    const fullPath = path.join(notesDir, notePath);
    try {
      const fileData = await fs.readFile(fullPath, "utf8");
      const note = JSON.parse(fileData);
      return note.content;
    } catch (err) {
      console.error(`Error reading note at ${notePath}:`, err);
      return null;
    }
  });
  ipcMain.on("save-note-content", async (event, { id, path: notePath, content }) => {
    await ensureNotesDirExists();
    const fullPath = path.join(notesDir, notePath);
    try {
      const fileData = await fs.readFile(fullPath, "utf8");
      const note = JSON.parse(fileData);
      note.content = content;
      await fs.writeFile(fullPath, JSON.stringify(note, null, 2));
    } catch (err) {
      console.error(`Error saving note at ${notePath}:`, err);
    }
  });
  ipcMain.on("update-note-title", async (event, { id, path: oldPath, newTitle, type }) => {
    await ensureNotesDirExists();
    const oldFullPath = path.join(notesDir, oldPath);
    newTitle = newTitle.replace(/[^a-zA-Z0-9\s-_.]/g, "").trim() || "Untitled";
    if (type === "folder") {
      const newFullPath = path.join(path.dirname(oldFullPath), newTitle);
      if (oldFullPath === newFullPath) return;
      try {
        await fs.rename(oldFullPath, newFullPath);
      } catch (err) {
        console.error(`Error renaming folder ${oldPath}:`, err);
      }
    } else if (type === "note") {
      try {
        const fileData = await fs.readFile(oldFullPath, "utf8");
        const note = JSON.parse(fileData);
        note.title = newTitle;
        await fs.writeFile(oldFullPath, JSON.stringify(note, null, 2));
      } catch (err) {
        console.error(`Error updating title for note ${id}:`, err);
      }
    }
  });
  ipcMain.handle("create-note", async (event, parentPath = ".") => {
    await ensureNotesDirExists();
    const fullDirPath = path.join(notesDir, parentPath);
    const newNote = {
      id: crypto.randomUUID(),
      title: "New Note",
      content: ""
    };
    const fileName = `${newNote.id}.json`;
    const filePath = path.join(fullDirPath, fileName);
    try {
      await fs.mkdir(fullDirPath, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(newNote, null, 2));
      const relativePath = path.relative(notesDir, filePath);
      return { id: newNote.id, title: newNote.title, type: "note", path: relativePath };
    } catch (err) {
      console.error("Error creating new note:", err);
      return null;
    }
  });
  ipcMain.on("delete-note", async (event, itemPath, type) => {
    await ensureNotesDirExists();
    const fullPath = path.join(notesDir, itemPath);
    try {
      if (type === "folder") {
        await fs.rm(fullPath, { recursive: true, force: true });
      } else {
        await fs.unlink(fullPath);
      }
    } catch (err) {
      console.error(`Error deleting item at ${itemPath}:`, err);
    }
  });
  ipcMain.handle("fs:create-folder", async (event, parentPath, folderName) => {
    await ensureNotesDirExists();
    folderName = String(folderName || "").replace(/[^a-zA-Z0-9\s-_.]/g, "").trim();
    if (!folderName) {
      return { success: false, error: "Invalid folder name provided." };
    }
    const fullPath = path.join(notesDir, parentPath || "", folderName);
    try {
      await fs.mkdir(fullPath, { recursive: true });
      return {
        success: true,
        path: fullPath,
        message: `Folder '${folderName}' created successfully.`
      };
    } catch (err) {
      console.error(`Error creating folder ${fullPath}:`, err);
      return {
        success: false,
        error: `Failed to create folder: ${err.code === "EEXIST" ? "Folder already exists." : err.message}`
      };
    }
  });
  ipcMain.handle("load-reminders", async () => {
    try {
      const data = await fs.readFile(remindersFilePath, "utf8");
      return JSON.parse(data);
    } catch (err) {
      await fs.writeFile(remindersFilePath, JSON.stringify([]));
      return [];
    }
  });
  ipcMain.on("save-reminders", async (event, reminders) => {
    await fs.writeFile(remindersFilePath, JSON.stringify(reminders));
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
app.on("ready", () => {
  if (!app.isPackaged) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          // RELAXED CSP to allow Tldraw to function in the Renderer process
          "Content-Security-Policy": [
            "default-src 'self' 'unsafe-eval' blob: data:; script-src 'self' http://localhost:5173 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' blob: data:; img-src 'self' data: blob:;"
          ]
        }
      });
    });
  }
  ensureNotesDirExists();
  createWindow();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
