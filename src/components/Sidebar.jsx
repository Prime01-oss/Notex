import React, { useState, useEffect } from 'react';

// Custom simple icons for the tree structure
const icons = {
  folder: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 002-2V8a2 2 0 00-2-2h-7.92a2 2 0 01-1.41-.58L9.41 3.41a2 2 0 00-1.41-.58H4a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  openFolder: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 20H4a2 2 0 01-2-2V5a2 2 0 012-2h3.92a2 2 0 011.41.58L10.92 7H19a2 2 0 012 2v9a2 2 0 01-2 2z" /></svg>,
  note: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
};

// Reusable component for the inline folder creation input
function NewFolderInput({ parentPath, onCreateFolder, onCancel }) {
  const [name, setName] = useState('');
  const inputRef = React.useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleCreate = () => {
    if (name.trim()) {
      setIsSubmitting(true);
      // App.jsx will call onCancel() when the file system operation finishes.
      onCreateFolder(parentPath, name.trim(), onCancel);
    } else {
      onCancel(); // If name is empty, close immediately
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCreate();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <li className="py-0.5">
      <div
        // 💡 FIX: Removed 'pr-2' class and added manual paddingRight to maintain alignment
        style={{ paddingLeft: `15px`, paddingRight: `12px` }}
        className="flex items-center w-full text-white rounded bg-zinc-700/50"
      >
        {/* Icon */}
        <div className="flex-shrink-0 flex items-center text-blue-400">
          <span className="p-1 mr-1">{icons.folder}</span>
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          // 💡 FIX: Call handleCreate on blur to save the folder
          onBlur={handleCreate}
          onKeyDown={handleKeyDown}
          placeholder="New folder name..."
          disabled={isSubmitting}
          className={`no-drag flex-1 p-2 text-white rounded truncate bg-transparent focus:outline-none focus:bg-zinc-700/80`}
        />

        {/* 🗑️ REMOVED CONFIRM BUTTON BLOCK */}
      </div>
    </li>
  );
}

// Recursive Tree Item Component
function TreeItem({ item, selectedNote, onItemSelect, onUpdateTitle, onCreateFolder, onCreateNote, depth = 0 }) {
  // ... (Rest of TreeItem logic remains the same)
  const isSelected = selectedNote && selectedNote.id === item.id;
  const [isExpanded, setIsExpanded] = useState(true);
  const [title, setTitle] = useState(item.title);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNestedFolder, setIsCreatingNestedFolder] = useState(false);

  useEffect(() => {
    setTitle(item.title);
    setIsEditing(false);
  }, [item.title, item.id]);

  const handleBlur = () => {
    if (title.trim() !== item.title) {
      onUpdateTitle(item, title);
    }
    setIsEditing(false);
  };

  const handleItemClick = () => {
    onItemSelect(item);
  };

  const handleItemDoubleClick = () => {
    setIsEditing(true);
  }

  const handleCreateNote = (e) => {
    e.stopPropagation();
    onCreateNote(item.path);
  }

  const handleCreateFolder = (e) => {
    e.stopPropagation();
    setIsExpanded(true);
    setIsCreatingNestedFolder(true);
  }

  const handleNestedFolderCreation = (parentPath, folderName, onComplete) => {
    onCreateFolder(parentPath, folderName, onComplete);
  }

  const iconToRender = item.type === 'folder' ? (isExpanded || isCreatingNestedFolder ? icons.openFolder : icons.folder) : icons.note;

  return (
    <li className="py-0.5">
      <div
        onClick={handleItemClick}
        onDoubleClick={handleItemDoubleClick}
        style={{ paddingLeft: `${depth * 15}px` }}
        className={`flex items-center group w-full text-white rounded pr-2 cursor-pointer 
                   ${isSelected ? 'bg-orange-700 hover:bg-orange-700' : 'hover:bg-zinc-700/50'}`}
      >

        {/* Toggle/Icon */}
        <div className="flex-shrink-0 flex items-center text-orange-400">
          {iconToRender && <span className="p-1 mr-1">{iconToRender}</span>}
        </div>

        {/* Title Input */}
        <input
          type="text"
          value={title}
          readOnly={!isEditing}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          onClick={(e) => { e.stopPropagation(); }}
          className={`no-drag flex-1 p-2 text-white rounded truncate bg-transparent focus:outline-none 
                      ${isEditing ? 'focus:bg-zinc-700/80' : ''} 
                      ${isSelected ? 'bg-orange-700 focus:bg-orange-700/90' : 'hover:bg-zinc-700/50'}`}
        />

        {/* Actions (Folder only) - Visible on hover */}
        {item.type === 'folder' && !isCreatingNestedFolder && (
          <div className="no-drag flex flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCreateNote} className="no-drag p-1 text-white hover:text-green-500" title="New Note">
              {icons.note}
            </button>
            <button onClick={handleCreateFolder} className="no-drag p-1 text-white hover:text-blue-500" title="New Folder">
              {icons.folder}
            </button>
          </div>
        )}
      </div>

      {/* Children (Recursion) */}
      {item.children && item.type === 'folder' && isExpanded && (
        <ul className="pl-1">
          {/* 💡 FIX: Render the input field right after the folder item */}
          {isCreatingNestedFolder && (
            <NewFolderInput
              parentPath={item.path}
              onCreateFolder={handleNestedFolderCreation}
              // The function to close the input is the onCancel prop
              onCancel={() => setIsCreatingNestedFolder(false)}
            />
          )}

          {item.children.map(child => (
            <TreeItem
              key={child.id}
              item={child}
              selectedNote={selectedNote}
              onItemSelect={onItemSelect}
              onUpdateTitle={onUpdateTitle}
              onCreateFolder={onCreateFolder}
              onCreateNote={onCreateNote}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// Main Sidebar Component
export function Sidebar({ notes, selectedNote, onItemSelect, onCreateNote, onCreateFolder, onUpdateTitle }) {
  const rootPath = '.';
  // 💡 NEW STATE: To track if we are creating a folder at the root level.
  const [isCreatingRootFolder, setIsCreatingRootFolder] = useState(false);

  const handleRootCreateFolder = () => {
    setIsCreatingRootFolder(true);
  };

  const handleCancelRootCreation = () => {
    setIsCreatingRootFolder(false);
  };

  // 💡 FIX: This helper now expects the onComplete callback to be passed from the input component
  // and forwards it to the App.jsx prop.
  const handleCreationFromInput = (parentPath, folderName, onComplete) => {
    // Calls the prop from App.jsx, passing the name and the onComplete callback
    onCreateFolder(parentPath, folderName, onComplete);
  }

  return (
    <div className="w-1/3 max-w-xs bg-zinc-800/50 p-4 flex flex-col">
      <div className="flex justify-between gap-2 mb-4">
        {/* Create Note at Root */}
        <button
          onClick={() => onCreateNote(rootPath)}
          className="no-drag flex-1 px-2 py-2 bg-orange-600 rounded text-white font-semibold hover:bg-orange-500"
        >
          New Note
        </button>
        {/* Create Folder at Root (Now calls local handler) */}
        <button
          onClick={handleRootCreateFolder}
          className="no-drag flex-1 px-2 py-2 bg-zinc-600 rounded text-white font-semibold hover:bg-zinc-500"
        >
          New Folder
        </button>
      </div>

      {/* List of root-level items */}
      <ul className="flex-1 overflow-y-auto">
        {/* 💡 FIX: Conditional Input for Root Folder */}
        {isCreatingRootFolder && (
          <NewFolderInput
            parentPath={rootPath}
            onCreateFolder={handleCreationFromInput}
            // The function to close the input is the onCancel prop
            onCancel={handleCancelRootCreation}
          />
        )}

        {notes.map(note => (
          <TreeItem
            key={note.id}
            item={note}
            selectedNote={selectedNote}
            onItemSelect={onItemSelect}
            onUpdateTitle={onUpdateTitle}
            onCreateFolder={handleCreationFromInput} // Pass the name handler
            onCreateNote={onCreateNote}
          // depth starts at 0 for root items
          />
        ))}
      </ul>
    </div>
  );
}