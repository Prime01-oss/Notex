const { app, BrowserWindow, ipcMain, Notification, session } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('node:crypto');

// --- Define persistent file paths (Unchanged) ---
const userDataPath = app.getPath('userData');
const notesDir = path.join(userDataPath, 'Notes');
const remindersFilePath = path.join(userDataPath, 'reminders.json');

// --- Helper functions (small fix: recursive mkdir) ---
async function ensureNotesDirExists() {
    try {
        await fs.stat(notesDir);
    } catch (err) {
        await fs.mkdir(notesDir, { recursive: true });
    }
}

// --- NEW RECURSIVE FILE SCANNER ---
async function scanNotesDir(currentPath, baseDir) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    const tree = [];

    for (const entry of entries) {
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

        } else if (entry.isFile() && entry.name.endsWith('.canvas.json')) {
            try {
                const fileData = await fs.readFile(fullPath, 'utf8');
                const canvas = JSON.parse(fileData);

                tree.push({
                    id: canvas.id,
                    title: canvas.title,
                    type: 'canvas',
                    path: relativePath,
                    createdAt: canvas.createdAt || null
                });
            } catch (err) {
                console.error(`Error reading canvas file ${entry.name} at ${relativePath}:`, err);
            }
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            try {
                const fileData = await fs.readFile(fullPath, 'utf8');
                const note = JSON.parse(fileData);

                tree.push({
                    id: note.id,
                    title: note.title,
                    type: 'note',
                    path: relativePath,
                    createdAt: note.createdAt || null
                });
            } catch (err) {
                console.error(`Error reading note file ${entry.name} at ${relativePath}:`, err);
            }
        }
    }
    return tree.sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        return a.title.localeCompare(b.title);
    });
}

let mainWindow;

function createWindow() {
    const preloadScript = app.isPackaged
        ? path.join(__dirname, '../preload/preload.js')
        : path.join(__dirname, 'preload.js');

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

    const devServerURL = 'http://localhost:5173';

    if (!app.isPackaged) {
        console.log('[DEBUG] Loading Dev Server URL: ' + devServerURL);
        mainWindow.loadURL(devServerURL);
    } else {
        console.log('[DEBUG] Loading Production File');
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    ipcMain.on('show-notification', (event, title, description) => {
        const iconPath = app.isPackaged
            ? path.join(__dirname, '../renderer/notezone.png')
            : path.join(__dirname, 'public/notezone.png');

        const notification = new Notification({
            title,
            body: description,
            icon: iconPath
        });
        notification.show();
    });

    ipcMain.on('close-window', () => {
        if (mainWindow) mainWindow.close();
    });
    ipcMain.on('minimize-window', () => {
        if (mainWindow) mainWindow.minimize();
    });
    ipcMain.on('maximize-window', () => {
        if (mainWindow) {
            if (mainWindow.isMaximized()) mainWindow.unmaximize();
            else mainWindow.maximize();
        }
    });

    // --- Updated Notes Handlers ---

    // 1. Get Notes List
    ipcMain.handle('get-notes-list', async () => {
        await ensureNotesDirExists();
        return scanNotesDir(notesDir, notesDir);
    });

    // 2. Get Note Content
    ipcMain.handle('get-note-content', async (event, notePath) => {
        await ensureNotesDirExists();
        const fullPath = path.join(notesDir, notePath);
        try {
            const fileData = await fs.readFile(fullPath, 'utf8');
            const note = JSON.parse(fileData);

            // ✅ FIX #3: only parse JSON-like strings safely
            if (typeof note.content === 'string' && note.content.trim().startsWith('{')) {
                try {
                    note.content = JSON.parse(note.content);
                } catch {
                    /* keep as string */
                }
            }

            return { ...note, createdAt: note.createdAt || (note.content?.createdAt ?? null) };
        } catch (err) {
            console.error(`Error reading note at ${notePath}:`, err);
            return null;
        }
    });

    // 3. Save Note Content
    ipcMain.handle('save-note-content', async (event, { id, path: notePath, content }) => {
        await ensureNotesDirExists();
        const fullPath = path.join(notesDir, notePath);

        try {
            const fileData = await fs.readFile(fullPath, 'utf8');
            const note = JSON.parse(fileData);

            // --- FIX: BUG #2 (Save Corruption) ---
            // The frontend now sends the raw object. Just assign it.
            // The fs.writeFile below will do the *only* stringify.
            note.content = content;
            // --- END FIX ---

            // ✅ FIX #2: Update metadata and save safely
            note.updatedAt = new Date().toISOString();
            await fs.writeFile(fullPath, JSON.stringify(note, null, 2));
            return { success: true, path: notePath, updatedAt: note.updatedAt };
        } catch (err) {
            console.error(`Error saving note at ${notePath}:`, err);
            return { success: false, error: err.message };
        }
    });

    // 4. Update Item Title
    ipcMain.handle('update-note-title', async (event, { id, path: oldPath, newTitle, type }) => {
        await ensureNotesDirExists();
        const oldFullPath = path.join(notesDir, oldPath);

        newTitle = newTitle.replace(/[^a-zA-Z0-9\s-_.]/g, '').trim() || 'Untitled';

        if (type === 'folder') {
            const newFullPath = path.join(path.dirname(oldFullPath), newTitle);
            if (oldFullPath === newFullPath) return;

            try {
                await fs.rename(oldFullPath, newFullPath);
            } catch (err) {
                console.error(`Error renaming folder ${oldPath}:`, err);
            }
        } else if (type === 'note' || type === 'canvas') {
            try {
                const fileData = await fs.readFile(oldFullPath, 'utf8');
                const note = JSON.parse(fileData);
                note.title = newTitle;
                await fs.writeFile(oldFullPath, JSON.stringify(note, null, 2));
            } catch (err) {
                console.error(`Error updating title for note ${id}:`, err);
            }
        }
    });

    // --- FIX: BUG #5 ---
    // 5. Create Note (Simplified)
    ipcMain.handle('create-note', async (event, parentPath = '.', noteName = 'New Note') => {
        await ensureNotesDirExists();

        const fullDirPath = path.join(notesDir, parentPath);
        const safeTitle = (noteName || 'New Note').trim();

        // --- Timestamp and content logic removed from backend ---

        const newNote = {
            id: crypto.randomUUID(),
            title: safeTitle,
            content: '', // Content will be set by frontend
            type: 'note'
        };

        const fileName = `${newNote.id}.json`;
        const filePath = path.join(fullDirPath, fileName);

        try {
            await fs.mkdir(fullDirPath, { recursive: true });
            await fs.writeFile(filePath, JSON.stringify(newNote, null, 2));

            const relativePath = path.relative(notesDir, filePath);

            // --- Return object no longer contains createdAt ---
            return { id: newNote.id, title: newNote.title, type: 'note', path: relativePath };
        } catch (err) {
            console.error('Error creating new note:', err);
            return null;
        }
    });

    // 6. Delete Note/Folder
    ipcMain.handle('delete-note', async (event, itemPath, type) => {
        await ensureNotesDirExists();
        const fullPath = path.join(notesDir, itemPath);
        try {
            if (type === 'folder') {
                await fs.rm(fullPath, { recursive: true, force: true });
            } else {
                await fs.unlink(fullPath);
            }
            // --- FIX: BUG #3 (Delete Freeze) ---
            // Report success back to the frontend
            return { success: true };
            // --- END FIX ---
        } catch (err) {
            console.error(`Error deleting item at ${itemPath}:`, err);
            // --- FIX: BUG #3 (Delete Freeze) ---
            // Report failure back to the frontend
            return { success: false, error: err.message };
            // --- END FIX ---
        }
    });

    // --- FIX: BUG #1 (Folder Creation) ---
    // 7. Create Folder (Handler name fixed)
    // Changed 'create-folder' to 'fs:create-folder' to match preload.js
    ipcMain.handle('fs:create-folder', async (event, parentPath, folderName) => {
    // --- END FIX ---
        await ensureNotesDirExists();

        folderName = String(folderName || '')
            .replace(/[^a-zA-Z0-9\s-_.]/g, '')
            .trim();

        if (!folderName) {
            return { success: false, error: 'Invalid folder name provided.' };
        }

        const fullPath = path.join(notesDir, parentPath || '', folderName);

        try {
            await fs.mkdir(fullPath, { recursive: true });
            return { success: true, path: fullPath, message: `Folder '${folderName}' created successfully.` };
        } catch (err) {
            console.error(`Error creating folder ${fullPath}:`, err);
            return { success: false, error: `Failed to create folder: ${err.message}` };
        }
    });

    // 8. Create Canvas
    ipcMain.handle('create-canvas', async (event, parentPath = '.', canvasName = 'New Canvas') => {
        await ensureNotesDirExists();
        const fullDirPath = path.join(notesDir, parentPath);

        const safeTitle = (canvasName || 'New Canvas').trim();

        const createdAt = new Date().toLocaleString([], {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const newCanvas = {
            id: crypto.randomUUID(),
            title: safeTitle,
            type: 'canvas',
            createdAt,
            content: JSON.stringify({ store: {}, createdAt })
        };

        const fileName = `${newCanvas.id}.canvas.json`;
        const filePath = path.join(fullDirPath, fileName);

        try {
            await fs.mkdir(fullDirPath, { recursive: true });
            await fs.writeFile(filePath, JSON.stringify(newCanvas, null, 2));

            const relativePath = path.relative(notesDir, filePath);
            return { success: true, newItem: { id: newCanvas.id, title: newCanvas.title, type: 'canvas', path: relativePath, createdAt } };

        } catch (err) {
            console.error('Error creating new canvas:', err);
            return null;
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

// --- UPDATED APP READY HANDLER (FIXED CSP) ---
app.on('ready', () => {
    session.defaultSession.clearCache();

    if (!app.isPackaged) {
        session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    'Content-Security-Policy': [
                        "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: http://localhost:5173 ws://localhost:5173 https://cdn.tldraw.com https://unpkg.com https://esm.sh; " +
                        "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173 https://esm.sh https://unpkg.com; " +
                        "style-src 'self' 'unsafe-inline' blob: data: https://unpkg.com https://esm.sh; " +
                        "font-src 'self' data: blob: https://cdn.tldraw.com https://unpkg.com https://esm.sh; " +
                        "img-src 'self' data: blob: https://cdn.tldraw.com https://unpkg.com https://esm.sh; " +
                        "connect-src 'self' http://localhost:5173 ws://localhost:5173 https://cdn.tldraw.com https://unpkg.com https://esm.sh;"
                    ]
                }
            });
        });
    // --- FIX: BUG #2 ---
    // Added 'else' block for production CSP
    } else {
        session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    'Content-Security-Policy': [
                        "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://cdn.tldraw.com https://unpkg.com https://esm.sh; " +
                        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://esm.sh https://unpkg.com; " +
                        "style-src 'self' 'unsafe-inline' blob: data: https://unpkg.com https://esm.sh; " +
                        "font-src 'self' data: blob: https://cdn.tldraw.com https://unpkg.com https://esm.sh; " +
                        "img-src 'self' data: blob: https://cdn.tldraw.com https://unpkg.com https://esm.sh; " +
                        "connect-src 'self' https://cdn.tldraw.com https://unpkg.com https://esm.sh;"
                    ]
                }
            });
        });
    }

    ensureNotesDirExists();
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