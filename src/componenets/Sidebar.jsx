import React from 'react';

export function Sidebar({ notes, selectedNoteId, onNoteSelect, onCreateNote, onUpdateTitle }) {
  return (
    <div className="w-1/3 max-w-xs bg-zinc-800/50 p-4 flex flex-col">
      <button
        onClick={onCreateNote}
        className="no-drag w-full mb-4 px-4 py-2 bg-orange-600 rounded text-white font-semibold hover:bg-orange-500"
      >
        New Note
      </button>
      <ul className="flex-1 overflow-y-auto">
        {notes.map(note => (
          <NoteListItem
            key={note.id}
            note={note}
            isSelected={note.id === selectedNoteId}
            onSelect={() => onNoteSelect(note.id)}
            onUpdateTitle={onUpdateTitle}
          />
        ))}
      </ul>
    </div>
  );
}

// A sub-component for each item in the list
function NoteListItem({ note, isSelected, onSelect, onUpdateTitle }) {
  
  const handleTitleChange = (e) => {
    onUpdateTitle(note.id, e.target.value);
  };

  return (
    <li>
      <input
        type="text"
        defaultValue={note.title}
        onBlur={handleTitleChange} // Saves when you click off
        onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} // Saves on Enter
        onClick={onSelect} // Selects note when clicking title
        className={`w-full p-2 rounded truncate cursor-pointer bg-transparent focus:bg-zinc-700 ${isSelected ? 'bg-zinc-700' : 'hover:bg-zinc-700/50'}`}
      />
    </li>
  );
}