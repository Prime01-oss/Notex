const { app, BrowserWindow, ipcMain, Notification, session } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('node:crypto');

// --- Define persistent file paths (Unchanged) ---
const userDataPath = app.getPath('userData');
const notesDir = path.join(userDataPath, 'Notes');
const remindersFilePath = path.join(userDataPath, 'reminders.json');

// --- Helper functions (Unchanged) ---
async function ensureNotesDirExists() {
  try {
    await fs.stat(notesDir);
  } catch (err) {
    await fs.mkdir(notesDir);
  }
}

// --- NEW RECURSIVE FILE SCANNER ---
async function scanNotesDir(currentPath, baseDir) {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });
  const tree = [];

  for (const entry of entries) {
    // Ignore hidden files
    if (entry.name.startsWith('.')) continue;

    const fullPath = path.join(currentPath, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      const children = await scanNotesDir(fullPath, baseDir);
      tree.push({
        id: relativePath, 
        title: entry.name,
        type: 'folder',
        path: relativePath,
        children: children
      });
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      try {
        const fileData = await fs.readFile(fullPath, 'utf8');
        const note = JSON.parse(fileData);
        
        tree.push({
          id: note.id, // Keep the UUID as the canonical ID
          title: note.title,
          type: 'note',
          path: relativePath, // Relative path for file operations
        });
      } catch (err) {
        console.error(`Error reading note file ${entry.name} at ${relativePath}:`, err);
      }
    }
  }
  return tree.sort((a, b) => {
    // Sort folders before notes, then alphabetically
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;
    return a.title.localeCompare(b.title);
  });
}
// --- END NEW HELPER ---

let mainWindow;

function createWindow() {
  // --- FIX: RESTORED preloadScript DECLARATION ---
  const preloadScript = app.isPackaged 
    ? path.join(__dirname, '../preload/preload.js') // Production path
    : path.join(__dirname, 'preload.js');          // Development path
  // --- END FIX ---

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


  // --- 'show-notification' handler (Unchanged) ---
  ipcMain.on('show-notification', (event, title, description) => {
    const iconPath = app.isPackaged
      ? path.join(__dirname, '../renderer/notezone.png') // Prod path
      : path.join(__dirname, 'public/notezone.png');    // Dev path (assumes icon is in /public)

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

  // --- UPDATED Notes Handlers to support Tree Structure (Unchanged) ---

  // 1. Get Notes List (now returns a nested tree)
  ipcMain.handle('get-notes-list', async () => {
    await ensureNotesDirExists();
    return scanNotesDir(notesDir, notesDir); // Use new recursive scanner
  });

  // 2. Get Note Content (uses notePath)
  ipcMain.handle('get-note-content', async (event, notePath) => {
    await ensureNotesDirExists();
    const fullPath = path.join(notesDir, notePath); // Use full path
    try {
      const fileData = await fs.readFile(fullPath, 'utf8');
      const note = JSON.parse(fileData);
      return note.content;
    } catch (err) {
      console.error(`Error reading note at ${notePath}:`, err);
      return null;
    }
  });

  // 3. Save Note Content (uses notePath)
  ipcMain.on('save-note-content', async (event, { id, path: notePath, content }) => {
    await ensureNotesDirExists();
    const fullPath = path.join(notesDir, notePath); // Use full path
    try {
      const fileData = await fs.readFile(fullPath, 'utf8');
      const note = JSON.parse(fileData);
      note.content = content;
      await fs.writeFile(fullPath, JSON.stringify(note, null, 2));
    } catch (err) {
      console.error(`Error saving note at ${notePath}:`, err);
    }
  });

  // 4. Update Item Title (for notes and folders)
  ipcMain.on('update-note-title', async (event, { id, path: oldPath, newTitle, type }) => {
    await ensureNotesDirExists();
    const oldFullPath = path.join(notesDir, oldPath);
    
    // Sanitize new title to prevent path traversal
    newTitle = newTitle.replace(/[^a-zA-Z0-9\s-_.]/g, '').trim() || 'Untitled';
    
    if (type === 'folder') {
      // Rename the directory on the file system
      const newFullPath = path.join(path.dirname(oldFullPath), newTitle);
      // Prevent renaming to the same name or an empty name
      if (oldFullPath === newFullPath) return;

      try {
        await fs.rename(oldFullPath, newFullPath);
      } catch (err) {
        console.error(`Error renaming folder ${oldPath}:`, err);
      }
  	} else if (type === 'note') {
      // A note's title is stored inside its JSON file
      try {
        const fileData = await fs.readFile(oldFullPath, 'utf8');
        const note = JSON.parse(fileData);
        note.title = newTitle; // Update the title property
        await fs.writeFile(oldFullPath, JSON.stringify(note, null, 2));
      } catch (err) {
        console.error(`Error updating title for note ${id}:`, err);
      }
  	}
  });

  // 5. Create Note (supports parentPath)
  ipcMain.handle('create-note', async (event, parentPath = '.') => {
    await ensureNotesDirExists();
    const fullDirPath = path.join(notesDir, parentPath); // Full folder path

    const newNote = {
      id: crypto.randomUUID(),
      title: 'New Note',
      content: ''
    };
  	const fileName = `${newNote.id}.json`;
  	const filePath = path.join(fullDirPath, fileName);
    
  	try {
      await fs.mkdir(fullDirPath, { recursive: true }); // Ensure path exists
      await fs.writeFile(filePath, JSON.stringify(newNote, null, 2));
      
      const relativePath = path.relative(notesDir, filePath);
      
      // Return the new node data structure
      return { id: newNote.id, title: newNote.title, type: 'note', path: relativePath };
  	} catch (err) {
      console.error('Error creating new note:', err);
      return null;
  	}
  });

  // 6. Delete Note/Folder (uses path and type)
  ipcMain.on('delete-note', async (event, itemPath, type) => {
  	await ensureNotesDirExists();
  	const fullPath = path.join(notesDir, itemPath); // Use full path
  	try {
      	if (type === 'folder') {
        // Recursively remove directory
        	await fs.rm(fullPath, { recursive: true, force: true });
      	} else {
        // Delete note file
        	await fs.unlink(fullPath);
      	}
  	} catch (err) { 
    	console.error(`Error deleting item at ${itemPath}:`, err);
  	} 
  });

  // 7. NEW: Create Folder
  ipcMain.on('create-folder', async (event, parentPath, folderName) => {
  	await ensureNotesDirExists();
    // Sanitize folderName
  	folderName = folderName.replace(/[^a-zA-Z0-9\s-_.]/g, '').trim() || 'New Folder';
    
  	const fullPath = path.join(notesDir, parentPath, folderName);
  	try {
        // FIX: Added { recursive: true } to create parent folders if needed and prevent 'EEXIST' errors.
      	await fs.mkdir(fullPath, { recursive: true });
  	} catch (err) {
    	console.error(`Error creating folder ${fullPath}:`, err);
  	}
  });
  
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

// --- UPDATED APP READY HANDLER (Unchanged) ---
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