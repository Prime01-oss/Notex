const { app, BrowserWindow, ipcMain, Notification, session } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('node:crypto');

// --- Define persistent file paths (Unchanged) ---
const userDataPath = app.getPath('userData');
const notesDir = path.join(userDataPath, 'Notes');
const remindersFilePath = path.join(userDataPath, 'reminders.json');

// --- Helper function (Unchanged) ---
async function ensureNotesDirExists() {
  try {
    await fs.stat(notesDir);
  } catch (err) {
    await fs.mkdir(notesDir);
  }
}

let mainWindow;

function createWindow() {
  // This correctly points to the preload script in BOTH
  // development (root) and production (out/preload)
  const preloadScript = app.isPackaged
    ? path.join(__dirname, '../preload/preload.js') // Production path
    : path.join(__dirname, 'preload.js');          // Development path

  mainWindow = new BrowserWindow({
    width: 1300,
    height: 1650,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: preloadScript // <-- Use the fixed path
    },
    frame: false,
    transparent: true,
    titleBarStyle: 'hidden',
    vibrancy: 'ultra-dark',
    backgroundColor: '#00000000',
    show: false
  });


  // --- UPDATED LOADING LOGIC (THE FIX) ---
  const devServerURL = 'http://localhost:5173'; // Default Vite port

  if (!app.isPackaged) {
    console.log('[DEBUG] Loading Dev Server URL: ' + devServerURL);
    mainWindow.loadURL(devServerURL);
  } else {
    console.log('[DEBUG] Loading Production File');
    // This path is for production builds
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
  // --- END LOGIC ---


  // --- 'show-notification' handler ---
  ipcMain.on('show-notification', (event, title, description) => {
    const iconPath = app.isPackaged
      ? path.join(__dirname, '../renderer/notezone.png') // Prod path
      : path.join(__dirname, 'public/notezone.png');    // Dev path (assumes icon is in /public)

    const notification = new Notification({
      title,
      body: description,
      icon: iconPath
    });
    notification.show();
  });

  // --- Window Control Handlers (Unchanged) ---
  ipcMain.on('close-window', () => {
    if (mainWindow) {
        mainWindow.close();
    }
  });
  ipcMain.on('minimize-window', () => {
    if (mainWindow) {
        mainWindow.minimize();
    }
  });
  ipcMain.on('maximize-window', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
  });

  // --- Notes Handlers (Unchanged) ---
  ipcMain.handle('get-notes-list', async () => {
    await ensureNotesDirExists();
    const noteFiles = await fs.readdir(notesDir);
    const notesList = [];
    for (const file of noteFiles) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(notesDir, file);
          const fileData = await fs.readFile(filePath, 'utf8');
          const note = JSON.parse(fileData);
          notesList.push({ id: note.id, title: note.title });
        } catch (err) {
          console.error(`Error reading note file ${file}:`, err);
        }
      }
    }
    return notesList;
  });

  ipcMain.handle('get-note-content', async (event, noteId) => {
    await ensureNotesDirExists();
    const filePath = path.join(notesDir, `${noteId}.json`);
    try {
      const fileData = await fs.readFile(filePath, 'utf8');
      const note = JSON.parse(fileData);
      return note.content;
    } catch (err) {
      console.error(`Error reading note ${noteId}:`, err);
      return null;
    }
  });

  ipcMain.on('save-note-content', async (event, { id, content }) => {
    await ensureNotesDirExists();
    const filePath = path.join(notesDir, `${id}.json`);
    try {
      const fileData = await fs.readFile(filePath, 'utf8');
      const note = JSON.parse(fileData);
      note.content = content;
      await fs.writeFile(filePath, JSON.stringify(note, null, 2));
    } catch (err) {
      console.error(`Error saving note ${id}:`, err);
    }
  });

  ipcMain.on('update-note-title', async (event, { id, newTitle }) => {
    await ensureNotesDirExists();
    const filePath = path.join(notesDir, `${id}.json`);
    try {
      const fileData = await fs.readFile(filePath, 'utf8');
      const note = JSON.parse(fileData);
      note.title = newTitle;
      await fs.writeFile(filePath, JSON.stringify(note, null, 2));
    } catch (err) {
      console.error(`Error updating title for note ${id}:`, err);
    }
  });

  ipcMain.handle('create-note', async () => {
    await ensureNotesDirExists();
    const newNote = {
      id: crypto.randomUUID(),
      title: 'New Note',
      content: ''
    };
    const filePath = path.join(notesDir, `${newNote.id}.json`);
    try {
      await fs.writeFile(filePath, JSON.stringify(newNote, null, 2));
      return { id: newNote.id, title: newNote.title };
    } catch (err) {
      console.error('Error creating new note:', err);
      return null;
    }
  });

  // --- THIS BLOCK IS NOW FIXED ---
  ipcMain.on('delete-note', async (event, noteId) => {
    await ensureNotesDirExists();
    const filePath = path.join(notesDir, `${noteId}.json`);
    try {
      await fs.unlink(filePath);
    } catch (err) { // <-- Added {
      console.error(`Error deleting note ${noteId}:`, err);
    } // <-- Added }
  });
  // --- END FIX ---
  
  // --- Reminders Handlers (Unchanged) ---
  ipcMain.handle('load-reminders', async () => {
    try {
      const data = await fs.readFile(remindersFilePath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      await fs.writeFile(remindersFilePath, JSON.stringify([]));
      return [];
    }
  });
  ipcMain.on('save-reminders', async (event, reminders) => {
    await fs.writeFile(remindersFilePath, JSON.stringify(reminders));
  });

  
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// --- UPDATED APP READY HANDLER ---
app.on('ready', () => {
  
  // --- FIX for CSP WARNING (Dev Only) ---
  if (!app.isPackaged) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          // Added 'unsafe-inline' to allow Vite's HMR script
          'Content-Security-Policy': ["script-src 'self' http://localhost:5173 'unsafe-inline'"]
        }
      });
    });
  }
  // --- END FIX ---

  ensureNotesDirExists(); // Ensure directory exists on app start
  createWindow();
});
// --- END UPDATED HANDLER ---


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});