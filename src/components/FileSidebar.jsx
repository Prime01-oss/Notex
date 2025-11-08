import React,
{
  useState,
  useEffect,
  useMemo
} from 'react';

// Custom simple icons for the tree structure
const icons = {
  folder: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 002-2V8a2 2 0 00-2-2h-7.92a2 2 0 01-1.41-.58L9.41 3.41a2 2 0 00-1.41-.58H4a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  openFolder: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 20H4a2 2 0 01-2-2V5a2 2 0 012-2h3.92a2 2 0 011.41.58L10.92 7H19a2 2 0 012 2v9a2 2 0 01-2 2z" /></svg>,
  note: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  search: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  trash: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  // ⬇️ --- FIX 1: ADDED CANVAS ICON --- ⬇️
  canvas: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
};

// Reusable component for the inline folder creation input
function NewFolderInput({
  parentPath,
  onCreateFolder,
  onCancel,
  depth = 0
}) {
  const [name, setName] = useState('');
  const inputRef = React.useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleCreate = () => {
    if (name.trim()) {
      setIsSubmitting(true);
      onCreateFolder(parentPath, name.trim(), onCancel);
    } else {
      onCancel();
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
    <li className="py-0.5" style={{ paddingLeft: `${depth * 15}px` }}>
      <div
        className="flex items-center w-full rounded pr-2 bg-gray-200/50 dark:bg-zinc-700/50"
      >
        <div className="flex-shrink-0 flex items-center text-blue-600 dark:text-blue-400">
          <span className="p-1 mr-1">{icons.folder}</span>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={onCancel}
          onKeyDown={handleKeyDown}
          placeholder="New folder name..."
          disabled={isSubmitting}
          className={`no-drag flex-1 p-2 rounded truncate bg-transparent focus:outline-none
                      text-black dark:text-white
                      focus:bg-gray-200/80 dark:focus:bg-zinc-700/80`}
        />
      </div>
    </li>
  );
}

// Recursive Tree Item Component
function TreeItem({
  item,
  selectedNote,
  onItemSelect,
  onUpdateTitle,
  onCreateFolder,
  onCreateNote,
  onCreateCanvas, // <-- ⬇️ --- FIX 2: ADDED ONCREATECANVAS PROP --- ⬇️
  onDeleteItem, 
  depth = 0
}) {
  const isSelected = selectedNote && selectedNote.id === item.id;
  const [isExpanded, setIsExpanded] = useState(true);
  const [title, setTitle] = useState(item.title);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNestedFolder, setIsCreatingNestedFolder] = useState(false);

  useEffect(() => {
    setTitle(item.title);
    setIsEditing(false);
  }, [item.title, item.id]);

  useEffect(() => {
    setIsExpanded(true); 
  }, [item.children]);


  const handleBlur = () => {
    if (title.trim() !== item.title) {
      onUpdateTitle(item, title);
    }
    setIsEditing(false);
  };

  const handleItemClick = () => {
    // ⬇️ --- FIX 3: ALLOW CLICKING ON CANVAS FILES --- ⬇️
    if (item.type === 'note' || item.type === 'canvas') {
      onItemSelect(item);
    } else {
      setIsExpanded(prev => !prev);
    }
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
  
  // ⬇️ --- FIX 4: ADDED HANDLER FOR CANVAS CREATION --- ⬇️
  const handleCreateCanvas = (e) => {
    e.stopPropagation();
    onCreateCanvas(item.path);
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Stop it from selecting the folder
    onDeleteItem(item); // Directly call the main delete function
  };

  const handleNestedFolderCreation = (parentPath, folderName, onComplete) => {
    onCreateFolder(parentPath, folderName, onComplete);
  }

  // ⬇️ --- FIX 5: UPDATED ICON LOGIC --- ⬇️
  const iconToRender = item.type === 'folder' 
    ? (isExpanded || isCreatingNestedFolder ? icons.openFolder : icons.folder) 
    : (item.type === 'canvas' ? icons.canvas : icons.note);

  return (
    <li className="py-0.5 relative">
      <div
        onClick={handleItemClick}
        onDoubleClick={handleItemDoubleClick}
        style={{ paddingLeft: `${depth * 15}px` }}
        className={`flex items-center group w-full rounded pr-2 cursor-pointer transition-colors
                    text-gray-800 dark:text-gray-200
                    ${isSelected
                      ? 'bg-blue-100 text-blue-700 font-medium hover:bg-blue-100/70 dark:bg-blue-800/70 dark:text-white dark:font-normal'
                      : 'hover:bg-gray-200/70 dark:hover:bg-zinc-700/50'
                    }`}
      >

        <div className={`flex-shrink-0 flex items-center ${isSelected ? 'text-blue-700 dark:text-white' : (item.type === 'canvas' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400')}`}>
          {iconToRender && <span className="p-1 mr-1">{iconToRender}</span>}
        </div>

        <input
          type="text"
          value={title}
          readOnly={!isEditing}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          onClick={(e) => { e.stopPropagation(); }}
          className={`no-drag flex-1 p-2 rounded truncate bg-transparent focus:outline-none
                      ${isEditing
                        ? 'focus:bg-gray-200/80 dark:focus:bg-zinc-700/80'
                        : ''}
                      ${isSelected
                        ? 'text-blue-700 placeholder:text-blue-300 dark:text-white dark:placeholder:text-gray-400'
                        : 'text-gray-800 dark:text-gray-200 placeholder:text-gray-500'
                      }`}
        />

        {/* Actions (Folder only) - Visible on hover */}
        {item.type === 'folder' && !isCreatingNestedFolder && (
          <div className="no-drag flex flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCreateNote} className="no-drag p-1 text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-500" title="New Note">
              {icons.note}
            </button>
            <button onClick={handleCreateFolder} className="no-drag p-1 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-500" title="New Folder">
              {icons.folder}
            </button>
            {/* ⬇️ --- FIX 6: ADDED CANVAS BUTTON TO HOVER --- ⬇️ */}
            <button onClick={handleCreateCanvas} className="no-drag p-1 text-gray-500 hover:text-purple-500 dark:text-gray-400 dark:hover:text-purple-500" title="New Canvas">
              {icons.canvas}
            </button>
            <button onClick={handleDeleteClick} className="no-drag p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500" title="Delete Folder">
              {icons.trash}
            </button>
          </div>
        )}
      </div>

      {/* Children (Recursion) */}
      {item.children && item.type === 'folder' && isExpanded && (
        <ul className="pl-4 ml-[11px] border-l border-gray-300 dark:border-zinc-700">
          {isCreatingNestedFolder && (
            <NewFolderInput
              parentPath={item.path}
              onCreateFolder={handleNestedFolderCreation}
              onCancel={() => setIsCreatingNestedFolder(false)}
              depth={0}
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
              onCreateCanvas={onCreateCanvas} // <-- ⬇️ --- FIX 7: PASS PROP RECURSIVELY --- ⬇️
              onDeleteItem={onDeleteItem} 
              depth={0}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

const filterTree = (nodes, term) => {
  if (!term) return nodes;
  const lowerCaseTerm = term.toLowerCase();
  return nodes.reduce((acc, node) => {
    const nodeMatches = node.title.toLowerCase().includes(lowerCaseTerm);
    if (node.type === 'folder') {
      const filteredChildren = filterTree(node.children || [], term);
      if (nodeMatches) {
        acc.push({ ...node, children: node.children || [] });
      }
      else if (filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren });
      }
    } else {
      // ⬇️ --- FIX 8: UPDATED FILTER LOGIC --- ⬇️
      // Now it matches notes OR canvases
      if (node.type === 'note' || node.type === 'canvas') {
        if (nodeMatches) {
          acc.push({ ...node });
        }
      }
    }
    return acc;
  }, []);
};

// Main Sidebar Component
export function FileSidebar({
  notes,
  selectedNote,
  onItemSelect,
  onCreateNote,
  onCreateFolder,
  onCreateCanvas, // <-- ⬇️ --- FIX 9: RECEIVE ONCREATECANVAS PROP --- ⬇️
  onUpdateTitle,
  onDeleteItem 
}) {
  const rootPath = '.';
  const [isCreatingRootFolder, setIsCreatingRootFolder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotes = useMemo(() => filterTree(notes, searchTerm), [notes, searchTerm]);

  const handleRootCreateFolder = () => {
    setIsCreatingRootFolder(true);
  };

  const handleCancelRootCreation = () => {
    setIsCreatingRootFolder(false);
  };

  const handleCreationFromInput = (parentPath, folderName, onComplete) => {
    onCreateFolder(parentPath, folderName, onComplete);
  }

  return (
    <div className="p-4 flex flex-col h-full bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700/50">
      
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="no-drag w-full pl-10 pr-4 py-2 rounded-md text-sm
                     bg-gray-100 text-gray-900 placeholder:text-gray-500
                     dark:bg-zinc-700/50 dark:text-white dark:placeholder:text-gray-400
                     border border-transparent focus:border-blue-500 focus:ring-0 focus:outline-none"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          {icons.search}
        </div>
      </div>
      
      <div className="flex justify-between gap-2 mb-4">
        <button
          onClick={() => onCreateNote(rootPath)}
          className="no-drag flex-1 px-4 py-2 bg-blue-600 rounded text-white font-bold text-sm transition-colors hover:bg-blue-500 shadow-md"
        >
          + Note
        </button>
        <button
          onClick={handleRootCreateFolder}
          className="no-drag flex-1 px-4 py-2 bg-gray-200 rounded text-gray-700 font-semibold text-sm transition-colors hover:bg-gray-300
                     dark:bg-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-600"
        >
          + Folder
        </button>
         <button
          onClick={() => onCreateCanvas(rootPath)} // <-- ⬇️ --- FIX 10: HOOKED UP ONCLICK --- ⬇️
          className="no-drag flex-1 px-4 py-2 bg-purple-700 rounded text-white font-bold text-sm transition-colors hover:bg-purple-600 shadow-md"
        >
          + Canvas
        </button>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {isCreatingRootFolder && (
          <NewFolderInput
            parentPath={rootPath}
            onCreateFolder={handleCreationFromInput}
            onCancel={handleCancelRootCreation}
            depth={0}
          />
        )}

        {filteredNotes.map(note => (
          <TreeItem
            key={note.id}
            item={note}
            selectedNote={selectedNote}
            onItemSelect={onItemSelect}
            onUpdateTitle={onUpdateTitle}
            onCreateFolder={handleCreationFromInput}
            onCreateNote={onCreateNote}
            onCreateCanvas={onCreateCanvas} // <-- ⬇️ --- FIX 11: PASS PROP TO TREEITEM --- ⬇️
            onDeleteItem={onDeleteItem} 
            depth={0}
          />
        ))}
      </ul>
    </div>
  );
}