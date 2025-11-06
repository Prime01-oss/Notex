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
        // loadNotesList needs to return a Promise to allow chaining in folder creation
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

    // 💡 IMPORTANT: loadNotesList must return the Promise so we can chain it.
    const loadNotesList = () => {
        // Fetches the entire nested structure
        return window.electronAPI.getNotesList().then(newNotes => {
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
    
    // --- Note/Folder Actions (FIXED ASYNC) ---

    // 💡 FIX: Accepts a third argument, `onComplete`, which is the cleanup function 
    // from the Sidebar/NewFolderInput.
    const handleFolderCreation = (parentPath, folderName, onComplete) => {
        if (folderName && folderName.trim() !== '') {
            // 1. Call Electron API and check the returned promise
            window.electronAPI.createFolder(parentPath, folderName)
                .then(result => {
                    // Assuming the Main Process returns { success: boolean, error?: string }
                    if (result && result.success) {
                        // 2. ONLY if successful, reload the list (which returns a Promise)
                        return loadNotesList(); 
                    } else {
                        // Handle Main Process error (e.g., Folder already exists)
                        alert(`Creation Failed: ${result ? result.error : 'Unknown error'}`);
                        // 3. Close the input box even on failure
                        if (onComplete) onComplete(); 
                        // Stop the promise chain here
                        throw new Error('Folder creation failed in Main Process.');
                    }
                })
                .then(() => {
                    // 4. Success: Notify the Sidebar to close the input after reload is complete
                    if (onComplete) onComplete();
                })
                .catch(error => {
                    // Catch network/API errors or the error thrown above
                    console.error("Folder creation failed:", error);
                    // Ensure cleanup happens if an error occurred before step 4
                    if (error.message.includes('Main Process') && onComplete) {
                        // This path is already handled above, but here for robustness.
                        // We skip calling onComplete again if it was handled in the previous .then()
                    } else if (onComplete) {
                        onComplete();
                    }
                });
        } else {
            // If name is empty, close the input immediately
            if (onComplete) onComplete(); 
        }
    };
    
    // 💡 The prop now expects the new 3-argument signature.
    const createFolder = handleFolderCreation;


    const createNote = (parentPath = '.') => {
        window.electronAPI.createNote(parentPath).then(newNote => {
            if (newNote) {
                // Refresh the tree structure to reflect the file change
                loadNotesList(); 
                setSelectedNote(newNote);
            }
        });
    };
    // ... (deleteItem, saveNote, updateItemTitle remain the same as they use loadNotesList())
    const deleteItem = () => {
        if (selectedNote) {
            // For now, let's assume `confirm()` is allowed
            if (selectedNote.type === 'folder' && !confirm(`Are you sure you want to delete the folder "${selectedNote.title}" and all its contents?`)) {
                return;
            }
            
            window.electronAPI.deleteNote(selectedNote.path, selectedNote.type);
            
            setSelectedNote(null);
            loadNotesList();
        }
    };

    const saveNote = () => {
        if (selectedNote && selectedNote.type === 'note') {
            window.electronAPI.saveNoteContent({ 
                id: selectedNote.id, 
                path: selectedNote.path, 
                content: currentNoteContent 
            });
        }
    };

    const updateItemTitle = (itemToUpdate, newTitle) => {
        if (!newTitle || itemToUpdate.title === newTitle) return;
        
        window.electronAPI.updateNoteTitle({ 
            id: itemToUpdate.id, 
            path: itemToUpdate.path, 
            newTitle, 
            type: itemToUpdate.type 
        });
        
        loadNotesList();
        
        if (selectedNote && selectedNote.id === itemToUpdate.id) {
            setSelectedNote(prev => ({ ...prev, title: newTitle }));
        }
    };


    return (
        <div className="flex flex-col h-screen">
            {/* 1. Custom Title Bar */}
            <header className="titlebar flex justify-between items-center bg-zinc-800 p-2 pl-4">
                <h1 className="text-lg font-bold text-orange-500">Notex</h1>
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
                    // 💡 Prop signature updated to handle the cleanup callback
                    onCreateFolder={createFolder} 
                    onUpdateTitle={updateItemTitle}
                />
                {/* Editor */}
                <Editor
                    content={currentNoteContent}
                    onChange={setCurrentNoteContent}
                    onSave={saveNote}
                    onDelete={selectedNote ? deleteItem : null} 
                    isNoteSelected={selectedNote && selectedNote.type === 'note'} // To enable/disable save/editor
                />
            </main>
        </div>
    );
}

export default App;