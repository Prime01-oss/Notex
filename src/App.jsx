import React, { useState, useEffect } from 'react';
// 💡 FIX: Renamed Sidebar import to match the FileSidebar component
import { FileSidebar } from './components/FileSidebar'; 
import { Editor } from './components/Editor';
import { WindowControls } from './components/WindowControl';
// 💡 NEW: Import the NavigationBar
import { NavigationBar } from './components/NavigationBar';
// 💡 NEW: Import the Settings Panel
import { SettingsPanel } from './components/SettingsPanel';
// 💡 1. IMPORT THE NEW PROFILE PANEL
import { ProfilePanel } from './components/ProfilePanel';


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
    
    // 💡 NEW GLOBAL STATE FOR UI
    // 🎯 FIX: Changed initial state from 'files' to null. This starts the sidebar closed.
    const [activePanel, setActivePanel] = useState(null); // 'files', 'search', 'settings', or 'profile' (added profile)
    const [theme, setTheme] = useState('dark'); // 'dark' or 'light'
    const [notebookFont, setNotebookFont] = useState('sans'); // 'sans', 'serif', 'monospace'
    const [language, setLanguage] = useState('en'); // 'en', 'es', etc.


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
    
    // 💡 NEW: This effect manages the 'dark' class on the <html> tag
    // This controls Tailwind's darkMode: 'class' functionality.
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]); // Re-run this effect whenever 'theme' changes

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
        // 💡 1. UPDATED Root Div for light/dark mode
        // Removed the ternary and now rely on the <html> class.
        <div className="flex flex-col h-screen relative bg-gray-100 text-gray-900 dark:bg-zinc-900 dark:text-white">
            
            {/* 💡 2. UPDATED Header for light/dark mode */}
            <header className="titlebar flex justify-between items-center p-3 pl-4 
                          bg-gray-200/80 border-b border-gray-300/50 
                          dark:bg-zinc-800/80 dark:border-zinc-700/50">
                {/* 💡 3. UPDATED H1 for light/dark mode */}
                <h1 className="text-xl font-extrabold text-blue-600 dark:text-blue-400 tracking-wider">Notex</h1>
                <WindowControls />
            </header>

            {/* 2. Main Content Area */}
            <main className="flex flex-1 overflow-hidden">
                
                {/* Navigation Bar (Fixed Left) */}
                <NavigationBar 
                    activePanel={activePanel}
                    onPanelClick={setActivePanel} // Pass the setter to toggle panels
                />
                
                {/* Conditional Side Panels: Container manages opening/closing animation */}
                <div className={`
                    flex-shrink-0 transition-all duration-300 ease-in-out
                    ${/* 'profile' is correctly removed for the pop-up logic */ ''}
                    ${activePanel === 'files' || activePanel === 'settings' ? 'w-1/3 max-w-xs' : 'w-0 overflow-hidden'}
                    `}>
                    
                    {/* File Sidebar */}
                    {activePanel === 'files' && (
                        <FileSidebar
                            notes={notes}
                            selectedNote={selectedNote}
                            onItemSelect={handleItemSelect}
                            onCreateNote={createNote}
                            onCreateFolder={createFolder} 
                            onUpdateTitle={updateItemTitle}
                        />
                    )}
                    
                    {/* Settings Panel */}
                    {activePanel === 'settings' && (
                        <SettingsPanel 
                            theme={theme}
                            setTheme={setTheme}
                            notebookFont={notebookFont}
                            setNotebookFont={setNotebookFont}
                            language={language}
                            setLanguage={setLanguage}
                        />
                    )}
                    
                </div>
                
                {/* Editor: Takes up remaining space */}
                <Editor
                    content={currentNoteContent}
                    onChange={setCurrentNoteContent}
                    onSave={saveNote}
                    onDelete={selectedNote ? deleteItem : null} 
                    isNoteSelected={selectedNote && selectedNote.type === 'note'} 
                />
            </main>

            {/* RENDER THE PROFILE PANEL HERE (outside 'main') */}
            {activePanel === 'profile' && <ProfilePanel />}
        </div>
    );
}

export default App;