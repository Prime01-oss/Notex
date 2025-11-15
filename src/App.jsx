import React, { useState, useEffect, useRef } from 'react';
import { FileSidebar } from './components/FileSidebar';
import { Editor } from './components/Editor';
import { WindowControls } from './components/WindowControl';
import { NavigationBar } from './components/NavigationBar';
import { SettingsPanel } from './components/SettingsPanel';
import { ProfilePanel } from './components/ProfilePanel';
import { DrawingSpace } from './components/DrawingSpace';

function App() {
  const canvasCache = useRef({});
  const hasLoadedContent = useRef(false);
  const prevSelectedNote = useRef(null);

  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [currentNoteContent, setCurrentNoteContent] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);

  const [activePanel, setActivePanel] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [notebookFont, setNotebookFont] = useState('sans-serif');
  const [language, setLanguage] = useState('en');

  const [country, setCountry] = useState(() => localStorage.getItem('userCountry') || 'Asia/Kolkata');

  // 🧩 Helper: recursively find node by ID
  const findNodeById = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // 🧩 Ensure Notes Exist and Load
  const loadNotesList = async () => {
    try {
      const newNotes = await window.electronAPI.getNotesList();
      setNotes(newNotes || []);

      if (selectedNote) {
        const reSelectedNote = findNodeById(newNotes, selectedNote.id);
        setSelectedNote(reSelectedNote || null);
      }
    } catch (err) {
      console.error('Failed to load notes list:', err);
      setNotes([]);
    }
  };

  useEffect(() => {
    window.electronAPI.getNotesList().then(setNotes).catch(err => {
      console.error('getNotesList failed:', err);
      setNotes([]);
    });
  }, []);

  // 🧩 Load content (notes/canvas)
  useEffect(() => {
    if (!selectedNote) {
      setCurrentNoteContent('');
      hasLoadedContent.current = false;
      return;
    }

    const loadContent = async () => {
      try {
        if (selectedNote.type === 'canvas') {
          hasLoadedContent.current = false;
          const cached = canvasCache.current[selectedNote.id];
          if (cached) {
            setCurrentNoteContent(structuredClone(cached));
            hasLoadedContent.current = true;
            return;
          }
        }

        const noteData = await window.electronAPI.getNoteContent(selectedNote.path);
        if (!noteData) {
          setCurrentNoteContent('');
          hasLoadedContent.current = true;
          return;
        }

        const createdAtFromTop = noteData.createdAt;
        const contentField = noteData.content !== undefined ? noteData.content : noteData;
        const createdAtFromContent = contentField && typeof contentField === 'object' ? contentField.createdAt : undefined;
        const resolvedCreatedAt = createdAtFromTop || createdAtFromContent || selectedNote?.createdAt;

        setSelectedNote(prev => ({
          ...prev,
          createdAt: resolvedCreatedAt,
          title: noteData.title || prev?.title,
        }));

        let resolvedContent = '';
        if (contentField && typeof contentField === 'object') {
          if (contentField.store || contentField.document || contentField.pages) {
            resolvedContent = contentField;
          } else if (contentField.content !== undefined) {
            resolvedContent = contentField.content;
          } else {
            resolvedContent = contentField;
          }
        } else {
          resolvedContent = contentField || '';
        }

        setCurrentNoteContent(resolvedContent);
        hasLoadedContent.current = true;
      } catch (err) {
        console.error(`Error loading content for ${selectedNote?.path}:`, err);
        setCurrentNoteContent('');
        hasLoadedContent.current = true;
      }
    };

    // --- FIX: BUG #4 (Video Bug) ---
    // Only load content if we're not on a panel that hides the editor
    if (activePanel !== 'settings' && activePanel !== 'profile') {
      loadContent();
    }
    // --- END FIX ---

  }, [selectedNote, activePanel]); // --- FIX: BUG #4 (Video Bug) --- Add activePanel

  // 🎨 Theme + font sync
  // 🎨 Theme sync
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // 💾 Save logic — ✅ FIXED
  const saveNote = async (contentToSave, noteToSave) => {
    const note = noteToSave || selectedNote;
    if (!note) return;

    // --- FIX: BUG #2 (Save Corruption) ---
    // Send the raw object/string. DO NOT stringify here.
    // The backend (main.js) will do the one and only stringify.
    const finalContent = contentToSave ?? currentNoteContent;
    // --- END FIX ---

    const shouldSave = hasLoadedContent.current || contentToSave !== undefined;

    if (note.type === 'note' || note.type === 'canvas') {
      if (shouldSave) {
        try {
          console.log('[SAVE]', note.title, { path: note.path, len: finalContent?.length });
          const result = await window.electronAPI.saveNoteContent({
            id: note.id,
            path: note.path,
            content: finalContent,
          });

          if (result?.success) {
            setSaveStatus({ type: 'success', message: `💾 Auto-saved "${note.title}"` });
          } else {
            setSaveStatus({ type: 'error', message: `⚠️ Save failed: ${result?.error || 'Unknown error'}` });
          }
        } catch (err) {
          console.error('Save failed:', err);
          setSaveStatus({ type: 'error', message: '⚠️ Save failed unexpectedly' });
        } finally {
          setTimeout(() => setSaveStatus(null), 2500);
        }
      }
    }
  };

  // 🧩 Auto-save before switching
  const handleItemSelect = async (item) => {
    if (prevSelectedNote.current && hasLoadedContent.current) {
      await saveNote(undefined, prevSelectedNote.current);
    }
    prevSelectedNote.current = item;
    setSelectedNote(item);
  };

  // --- Creation handlers ---
  const createFolder = (parentPath, folderName, onComplete) => {
    if (!folderName?.trim()) return onComplete?.();
    window.electronAPI.createFolder(parentPath, folderName.trim())
      .then(result => {
        if (result?.success) return loadNotesList();
        alert(`Creation Failed: ${result?.error || 'Unknown error'}`);
      })
      .finally(onComplete);
  };

  const createNote = async (parentPath, noteName, onComplete) => {
    if (!noteName?.trim()) return onComplete?.();
    const tz = country || 'Asia/Kolkata';
    const createdAt = new Date().toLocaleString([], {
      timeZone: tz,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    try {
      const result = await window.electronAPI.createNote(parentPath, noteName.trim());
      if (result) {
        const noteWithTime = { ...result, createdAt };
        // --- FIX: BUG #2 (Save Corruption) ---
        // Send the raw object, not a stringified string
        await window.electronAPI.saveNoteContent({
          id: noteWithTime.id,
          path: noteWithTime.path,
          content: { createdAt }, // Send as object
        });
        // --- END FIX ---
        await loadNotesList();
        setSelectedNote(noteWithTime);
      }
    } catch (err) {
      console.error('createNote failed:', err);
    } finally {
      onComplete?.();
    }
  };

  const createCanvas = (parentPath, canvasName, onComplete) => {
    if (!canvasName?.trim()) return onComplete?.();
    window.electronAPI.createCanvas(parentPath, canvasName.trim())
      .then(result => {
        if (result?.success && result.newItem) {
          return loadNotesList().then(() => setSelectedNote(result.newItem));
        }
      })
      .finally(onComplete);
  };

  // --- Deletion ---
  // --- FIX: BUG #3 (Delete Freeze) ---
  // Added full try/catch and result checking
  const deleteItem = async (itemToDelete) => {
    if (!itemToDelete) return;
    const confirmDelete = window.confirm(`Delete "${itemToDelete.title}" permanently?`);
    if (!confirmDelete) return;

    try {
      const result = await window.electronAPI.deleteNote(itemToDelete.path, itemToDelete.type);
      if (result?.success) {
        if (selectedNote?.id === itemToDelete.id) setSelectedNote(null);
        loadNotesList();
      } else {
        alert(`Failed to delete: ${result?.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert(`Delete failed: ${err.message}`);
    }
  };

  const deleteMultipleItems = async (itemsToDelete) => {
    if (!itemsToDelete?.length) return;
    const confirmDelete = window.confirm(`Delete ${itemsToDelete.length} selected items?`);
    if (!confirmDelete) return;

    try {
      // Run all delete operations, even if some fail
      const results = await Promise.allSettled(
        itemsToDelete.map(item =>
          window.electronAPI.deleteNote(item.path, item.type)
        )
      );

      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value?.success));
      if (failed.length > 0) {
        console.error('Some items failed to delete:', failed);
        alert(`Failed to delete ${failed.length} items. Please refresh.`);
      }

      // Reload list whether it partially failed or fully succeeded
      if (itemsToDelete.some(i => i.id === selectedNote?.id)) setSelectedNote(null);
      loadNotesList();

    } catch (err) {
      console.error('Multi-delete failed:', err);
      alert(`Multi-delete failed: ${err.message}`);
    }
  };
  // --- END FIX ---

  const updateItemTitle = async (item, newTitle) => {
    if (!newTitle || item.title === newTitle) return;
    await window.electronAPI.updateNoteTitle({
      id: item.id,
      path: item.path,
      newTitle,
      type: item.type,
    });
    loadNotesList();
  };

  // --- UI ---
  return (
    <div className="flex flex-col h-screen relative bg-gray-100 text-gray-900 dark:bg-zinc-900 dark:text-white">
      <header className="titlebar flex justify-between items-center p-3 pl-4 bg-gray-200/80 border-b border-gray-300/50 dark:bg-zinc-800/80 dark:border-zinc-700/50">
        <h1 className="text-xl font-extrabold text-blue-600 dark:text-blue-400 tracking-wider">Notex</h1>
        <WindowControls />
      </header>

      <main className="flex flex-1 overflow-hidden">
        <NavigationBar activePanel={activePanel} onPanelClick={setActivePanel} />

        <div className={`flex-shrink-0 transition-all duration-300 ease-in-out ${activePanel === 'files' || activePanel === 'settings' ? 'w-1/3 max-w-xs' : 'w-0 overflow-hidden'}`}>
          {activePanel === 'files' && (
            <FileSidebar
              notes={notes}
              selectedNote={selectedNote}
              onItemSelect={handleItemSelect}
              onCreateNote={createNote}
              onCreateFolder={createFolder}
              onCreateCanvas={createCanvas}
              onUpdateTitle={updateItemTitle}
              onDeleteItem={deleteItem}
              onDeleteMultipleItems={deleteMultipleItems}
            />
          )}
          {activePanel === 'settings' && (
            <SettingsPanel
              theme={theme}
              setTheme={setTheme}
              notebookFont={notebookFont}
              setNotebookFont={setNotebookFont}
              language={language}
              setLanguage={setLanguage}
              country={country}
              setCountry={(val) => {
                setCountry(val);
                localStorage.setItem('userCountry', val);
              }}
            />
          )}
        </div>

        {(selectedNote && selectedNote.type === 'canvas') ? (
          <DrawingSpace
            key={selectedNote.id}
            content={currentNoteContent}
            onChange={(snapshot) => {
              setCurrentNoteContent(snapshot);
              if (selectedNote?.type === 'canvas') {
                canvasCache.current[selectedNote.id] = snapshot;
              }
              saveNote(snapshot);
            }}
            onSave={saveNote}
            onDelete={() => deleteItem(selectedNote)}
            theme={theme}
          />
        ) : activePanel === 'draw' ? (
          <DrawingSpace key="scratchpad" theme={theme} />
        ) : (
          <Editor
            content={currentNoteContent}
            onChange={(newContent) => {
              setCurrentNoteContent(newContent);
              saveNote(newContent);
            }}
            onSave={saveNote}
            onDelete={() => deleteItem(selectedNote)}
            isNoteSelected={selectedNote?.type === 'note'}
            selectedNote={selectedNote}
            notebookFont={notebookFont}
          />
        )}
      </main>

      {activePanel === 'profile' && <ProfilePanel />}

      {saveStatus && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-2 rounded-2xl shadow-lg text-sm font-semibold backdrop-blur-md transition-all duration-300 
    	 	       ${saveStatus.type === 'success' ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}
        >
          {saveStatus.message}
        </div>
      )}
    </div>
  );
}

export default App;