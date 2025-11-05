import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { WindowControls } from './components/WindowControl';

// Helper function to find a node by its ID in the nested notes array
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


function App() {
  // notes is now a nested array (the tree structure)
  const [notes, setNotes] = useState([]); 
  // selectedNote stores the full object: { id, title, type, path, children? }
  const [selectedNote, setSelectedNote] = useState(null); 
  const [currentNoteContent, setCurrentNoteContent] = useState('');

  // 1. Load the tree structure on app start
  useEffect(() => {
    loadNotesList();
  }, []);

  // 2. Load the content of the selected note
  useEffect(() => {
    // Only load content if the selected item is a 'note'
    if (selectedNote && selectedNote.type === 'note') {
      // Use the note's path to fetch content
      window.electronAPI.getNoteContent(selectedNote.path) 
        .then(content => setCurrentNoteContent(content || ''));
    } else {
      setCurrentNoteContent(''); // Clear editor for folders or nothing selected
    }
  }, [selectedNote]);

  const loadNotesList = () => {
    // Fetches the entire nested structure
    window.electronAPI.getNotesList().then(newNotes => {
        setNotes(newNotes);
        
        // Re-select the previously selected item if it still exists in the new tree
        if (selectedNote) {
            const reSelectedNote = findNodeById(newNotes, selectedNote.id);
            if (reSelectedNote) {
                // Important: Update selectedNote with the new object reference/paths
                setSelectedNote(reSelectedNote); 
            } else {
                setSelectedNote(null);
            }
        }
    });
  };

  const handleItemSelect = (item) => {
    setSelectedNote(item);
  };
  
  // --- Note/Folder Actions (UPDATED) ---

  const createFolder = (parentPath) => {
    const folderName = prompt("Enter new folder name:");
    if (folderName) {
        window.electronAPI.createFolder(parentPath, folderName);
        // Refresh the UI state: reload the list
        loadNotesList(); 
    }
  };

  const createNote = (parentPath = '.') => {
    window.electronAPI.createNote(parentPath).then(newNote => {
      if (newNote) {
        // Refresh the tree structure to reflect the file change
        loadNotesList(); 
        setSelectedNote(newNote);
      }
    });
  };

  const deleteItem = () => {
    if (selectedNote) {
      // Confirm deletion, especially for folders
      if (selectedNote.type === 'folder' && !confirm(`Are you sure you want to delete the folder "${selectedNote.title}" and all its contents?`)) {
          return;
      }
      
      // Pass path and type for the main process deletion logic
      window.electronAPI.deleteNote(selectedNote.path, selectedNote.type);
      
      // Reset selection and refresh the list
      setSelectedNote(null);
      loadNotesList();
    }
  };

  const saveNote = () => {
    if (selectedNote && selectedNote.type === 'note') {
      // Pass the necessary data including the path for the file system operation
      window.electronAPI.saveNoteContent({ 
          id: selectedNote.id, 
          path: selectedNote.path, 
          content: currentNoteContent 
      });
    }
  };

  const updateItemTitle = (itemToUpdate, newTitle) => {
    if (!newTitle || itemToUpdate.title === newTitle) return;
    
    // Pass full item details for main process to handle renaming/title update
    window.electronAPI.updateNoteTitle({ 
        id: itemToUpdate.id, 
        path: itemToUpdate.path, 
        newTitle, 
        type: itemToUpdate.type 
    });
    
    // Full reload is needed to ensure path updates (for folders) are reflected
    loadNotesList();
    
    // Update selected note title locally for immediate feedback
    if (selectedNote && selectedNote.id === itemToUpdate.id) {
        setSelectedNote(prev => ({ ...prev, title: newTitle }));
    }
  };


  return (
    <div className="flex flex-col h-screen">
      {/* 1. Custom Title Bar */}
      <header className="titlebar flex justify-between items-center bg-zinc-800 p-2 pl-4">
        <h1 className="text-lg font-bold text-orange-500">NoteZone</h1>
        <WindowControls />
      </header>

      {/* 2. Main Content Area */}
      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          notes={notes} // Nested array
          selectedNote={selectedNote} // Full object
          onItemSelect={handleItemSelect} // Use a generic select handler
          onCreateNote={createNote}
          onCreateFolder={createFolder}
          onUpdateTitle={updateItemTitle}
        />
        {/* Editor */}
        <Editor
          content={currentNoteContent}
          onChange={setCurrentNoteContent}
          onSave={saveNote}
          // Only pass onDelete if an item is selected
          onDelete={selectedNote ? deleteItem : null} 
          isNoteSelected={selectedNote && selectedNote.type === 'note'} // To enable/disable save/editor
        />
      </main>
    </div>
  );
}

export default App;