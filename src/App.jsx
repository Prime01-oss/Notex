import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { WindowControls } from './components/WindowControls';

function App() {
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [currentNoteContent, setCurrentNoteContent] = useState('');

  // 1. Load the list of notes on app start
  useEffect(() => {
    loadNotesList();
  }, []);

  // 2. Load the content of the selected note
  useEffect(() => {
    if (selectedNoteId) {
      window.electronAPI.getNoteContent(selectedNoteId)
        .then(content => setCurrentNoteContent(content));
    } else {
      setCurrentNoteContent('');
    }
  }, [selectedNoteId]);

  const loadNotesList = () => {
    window.electronAPI.getNotesList().then(setNotes);
  };

  const handleNoteSelect = (id) => {
    setSelectedNoteId(id);
  };

  // --- Note Actions ---

  const createNote = () => {
    window.electronAPI.createNote().then(newNote => {
      loadNotesList();
      setSelectedNoteId(newNote.id);
    });
  };

  const deleteNote = () => {
    if (selectedNoteId) {
      window.electronAPI.deleteNote(selectedNoteId);
      loadNotesList();
      setSelectedNoteId(null);
    }
  };

  const saveNote = () => {
    if (selectedNoteId) {
      window.electronAPI.saveNoteContent({ id: selectedNoteId, content: currentNoteContent });
    }
  };

  const updateNoteTitle = (id, newTitle) => {
    window.electronAPI.updateNoteTitle({ id, newTitle });
    loadNotesList();
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
          notes={notes}
          selectedNoteId={selectedNoteId}
          onNoteSelect={handleNoteSelect}
          onCreateNote={createNote}
          onUpdateTitle={updateNoteTitle}
        />
        {/* Editor */}
        <Editor
          content={currentNoteContent}
          onChange={setCurrentNoteContent}
          onSave={saveNote}
          onDelete={deleteNote}
        />
      </main>
    </div>
  );
}

export default App;