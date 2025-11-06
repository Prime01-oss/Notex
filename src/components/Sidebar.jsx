import React, { useState, useEffect } from 'react'; 

// Custom simple icons for the tree structure
const icons = {
  folder: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 002-2V8a2 2 0 00-2-2h-7.92a2 2 0 01-1.41-.58L9.41 3.41a2 2 0 00-1.41-.58H4a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>,
  openFolder: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 20H4a2 2 0 01-2-2V5a2 2 0 012-2h3.92a2 2 0 011.41.58L10.92 7H19a2 2 0 012 2v9a2 2 0 01-2 2z" /></svg>,
  note: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
};


// Recursive Tree Item Component
function TreeItem({ item, selectedNote, onItemSelect, onUpdateTitle, onCreateFolder, onCreateNote, depth = 0 }) {
  // Use id for canonical comparison
  const isSelected = selectedNote && selectedNote.id === item.id; 
  // State for folder expansion
  const [isExpanded, setIsExpanded] = useState(true); 
  // Local state for immediate input feedback
  const [title, setTitle] = useState(item.title);
  // NEW STATE: Track if the item is being edited (disabled by default)
  const [isEditing, setIsEditing] = useState(false);

  // Sync local state if the note prop changes (e.g., after reload)
  useEffect(() => {
    setTitle(item.title);
    // Reset editing state when the selected item changes
    setIsEditing(false);
  }, [item.title, item.id]);

  const handleBlur = () => {
    // Only commit if the title actually changed
    if (title.trim() !== item.title) {
      onUpdateTitle(item, title);
    }
    // Exit editing mode on blur
    setIsEditing(false);
  };

  const toggleExpand = (e) => {
    e.stopPropagation(); // Prevent folder click from also selecting the item
    setIsExpanded(!isExpanded);
  }

  // Handle click on the entire item container (SELECT / OPEN)
  const handleItemClick = () => {
    onItemSelect(item);
  };
  
  // NEW: Handle double-click on the item container (RENAME)
  const handleItemDoubleClick = () => {
    setIsEditing(true);
  }
  
  // Handle new note creation (only in folders or root)
  const handleCreateNote = (e) => {
    e.stopPropagation();
    onCreateNote(item.path);
  }
  
  // Handle new folder creation (only in folders or root)
  const handleCreateFolder = (e) => {
    e.stopPropagation();
    onCreateFolder(item.path);
  }
  
  const iconToRender = item.type === 'folder' ? (isExpanded ? icons.openFolder : icons.folder) : icons.note;

  return (
    <li className="py-0.5">
      <div 
        onClick={handleItemClick}
        onDoubleClick={handleItemDoubleClick} // ADDED: Double-click to rename
        // Increase padding based on depth
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
          readOnly={!isEditing} // KEY CHANGE: Input is read-only unless isEditing is true
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          // Stop propagation for the input field (prevents re-selecting item when double-clicking the text)
          onClick={(e) => { e.stopPropagation(); }} 
          className={`no-drag flex-1 p-2 rounded truncate bg-transparent focus:outline-none 
                      ${isEditing ? 'focus:bg-zinc-700/80' : ''} 
                      ${isSelected ? 'bg-orange-700 focus:bg-orange-700/90' : 'hover:bg-zinc-700/50'}`}
        />
        
        {/* Actions (Folder only) - Visible on hover */}
        {item.type === 'folder' && (
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
      {item.children && item.children.length > 0 && item.type === 'folder' && isExpanded && (
        <ul className="pl-1">
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
  // Root path in the file system for creation outside a folder
  const rootPath = '.'; 

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
        {/* Create Folder at Root */}
        <button
          onClick={() => onCreateFolder(rootPath)}
          className="no-drag flex-1 px-2 py-2 bg-zinc-600 rounded text-white font-semibold hover:bg-zinc-500"
        >
          New Folder
        </button>
      </div>
      
      {/* List of root-level items */}
      <ul className="flex-1 overflow-y-auto">
        {notes.map(note => (
          <TreeItem
            key={note.id}
            item={note}
            selectedNote={selectedNote}
            onItemSelect={onItemSelect}
            onUpdateTitle={onUpdateTitle}
            onCreateFolder={onCreateFolder}
            onCreateNote={onCreateNote}
            // depth starts at 0 for root items
          />
        ))}
      </ul>
    </div>
  );
}