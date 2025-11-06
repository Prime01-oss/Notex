import React from 'react';

export function Editor({ content, onChange, onSave, onDelete, isNoteSelected }) {
  return (
    <div className="flex-1 flex flex-col p-4 bg-zinc-900/50">
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 w-full h-full p-4 bg-zinc-800/50 rounded resize-none focus:outline-none"
        placeholder={isNoteSelected ? "Start typing your note..." : "Select a note from the File-sidebar to begin editing."}
        // Disable text area if no note is selected
        disabled={!isNoteSelected} 
      />
      <div className="flex justify-end gap-4 mt-4">
        {/* Delete button: Visible if onDelete handler is passed (meaning something is selected) */}
        {onDelete && (
          <button
            onClick={onDelete}
            className="no-drag px-6 py-2 bg-red-600/80 rounded text-white font-semibold hover:bg-red-500"
          >
            Delete
          </button>
        )}
        {/* Save button: Only enabled if a note is selected */}
        <button
          onClick={onSave}
          disabled={!isNoteSelected}
          className={`no-drag px-6 py-2 rounded text-white font-semibold 
                      ${isNoteSelected ? 'bg-orange-600 hover:bg-orange-500' : 'bg-gray-600 cursor-not-allowed'}`}
        >
          Save
        </button>
      </div>
    </div>
  );
}