import React from 'react';

export function Editor({ content, onChange, onSave, onDelete }) {
  return (
    <div className="flex-1 flex flex-col p-4 bg-zinc-900/50">
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 w-full h-full p-4 bg-zinc-800/50 rounded resize-none focus:outline-none"
        placeholder="Start typing your note..."
      />
      <div className="flex justify-end gap-4 mt-4">
        <button
          onClick={onDelete}
          className="no-drag px-6 py-2 bg-red-600/80 rounded text-white font-semibold hover:bg-red-500"
        >
          Delete
        </button>
        <button
          onClick={onSave}
          className="no-drag px-6 py-2 bg-orange-600 rounded text-white font-semibold hover:bg-orange-500"
        >
          Save
        </button>
      </div>
    </div>
  );
}