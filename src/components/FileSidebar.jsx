import React, { useState, useEffect, useMemo } from 'react';

// --- Inline SVG Icons ---
const icons = {
  folder: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20h16a2 2 0 002-2V8a2 2 0 00-2-2h-7.92a2 2 0 01-1.41-.58L9.41 3.41a2 2 0 00-1.41-.58H4a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>,
  openFolder: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 20H4a2 2 0 01-2-2V5a2 2 0 012-2h3.92a2 2 0 011.41.58L10.92 7H19a2 2 0 012 2v9a2 2 0 01-2 2z"/></svg>,
  note: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  trash: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  search: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
};

// --- Helper: Flatten all nested nodes ---
const flattenNodes = (nodes) =>
  nodes.flatMap(node => [
    node,
    ...(node.children ? flattenNodes(node.children) : [])
  ]);

// --- Input Component for Creating Items ---
function NewItemInput({ parentPath, itemType, onCreate, onCancel, depth = 0 }) {
  const [name, setName] = useState('');
  const inputRef = React.useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const config = {
    folder: { icon: icons.folder, color: 'text-yellow-600 dark:text-yellow-500', placeholder: 'New folder name...' },
    note: { icon: icons.note, color: 'text-blue-600 dark:text-blue-400', placeholder: 'New note name...' },
  }[itemType];

  const handleCreate = () => {
    if (name.trim()) {
      setIsSubmitting(true);
      onCreate(parentPath, name.trim(), onCancel);
    } else onCancel();
  };

  return (
    <li className="py-0.5" style={{ paddingLeft: `${depth * 15}px` }}>
      <div className="flex items-center bg-gray-200/50 dark:bg-zinc-700/50 rounded pr-2">
        <span className={`p-1 mr-1 ${config.color}`}>{config.icon}</span>
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreate();
            else if (e.key === 'Escape') onCancel();
          }}
          onBlur={onCancel}
          placeholder={config.placeholder}
          disabled={isSubmitting}
          className="flex-1 p-2 bg-transparent focus:outline-none text-black dark:text-white"
        />
      </div>
    </li>
  );
}

// --- Recursive Tree Item Component ---
function TreeItem({
  item,
  selectedNote,
  onItemSelect,
  onUpdateTitle,
  onCreateFolder,
  onCreateNote,
  onDeleteItem,
  depth = 0,
  checkedIds,
  onCheckChange,
  isDeleteMode
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [creating, setCreating] = useState(null);

  const isSelected = selectedNote?.id === item.id;
  const isCheckable = item.type === 'note';
  const icon =
    item.type === 'folder' ? (isExpanded ? icons.openFolder : icons.folder)
      : icons.note;

  useEffect(() => {
    setTitle(item.title);
  }, [item.title]);

  const handleClick = () => {
    if (item.type === 'folder') setIsExpanded(prev => !prev);
    else onItemSelect(item);
  };

  const handleEditBlur = async () => {
    if (title.trim() && title !== item.title) await onUpdateTitle(item, title.trim());
    setIsEditing(false);
  };

  return (
    <li className="py-0.5">
      <div
        style={{ paddingLeft: `${depth * 15}px` }}
        onClick={handleClick}
        onDoubleClick={() => setIsEditing(true)}
        className={`flex items-center group w-full rounded pr-2 cursor-pointer transition-colors
          ${isSelected
            ? 'bg-blue-100 text-blue-700 font-medium dark:bg-blue-800/70 dark:text-white'
            : 'hover:bg-gray-200/60 dark:hover:bg-zinc-700/50 text-gray-800 dark:text-gray-200'
          }`}
      >
        {/* Checkboxes in delete mode */}
        {isCheckable ? (
          isDeleteMode ? (
            <input
              type="checkbox"
              checked={checkedIds.has(item.id)}
              onChange={() => onCheckChange(item.id)}
              className="mr-2"
              onClick={(e) => e.stopPropagation()}
            />
          ) : <div className="w-4 mr-2" />
        ) : <div className="w-4 mr-2" />}

        <span className={`p-1 mr-1 ${item.type === 'folder'
            ? 'text-yellow-600 dark:text-yellow-500'
            : 'text-blue-600 dark:text-blue-400'
          }`}>
          {icon}
        </span>

        <input
          type="text"
          value={title}
          readOnly={!isEditing}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleEditBlur}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          className={`flex-1 bg-transparent p-1 truncate focus:outline-none ${
            isEditing
              ? 'bg-gray-200/80 dark:bg-zinc-700/80'
              : 'cursor-pointer'
          }`}
        />

        {item.type === 'folder' && !isDeleteMode && (
          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); setCreating('note'); }} className="p-1 hover:text-blue-500">{icons.note}</button>
            <button onClick={(e) => { e.stopPropagation(); setCreating('folder'); }} className="p-1 hover:text-yellow-500">{icons.folder}</button>
            <button onClick={(e) => { e.stopPropagation(); onDeleteItem(item); }} className="p-1 hover:text-red-500">{icons.trash}</button>
          </div>
        )}
      </div>

      {/* Child nodes */}
      {item.children && item.type === 'folder' && isExpanded && (
        <ul className="pl-4 ml-[11px] border-l border-gray-300 dark:border-zinc-700">
          {creating && (
            <NewItemInput
              parentPath={item.path}
              itemType={creating}
              onCreate={
                creating === 'note' ? onCreateNote :
                onCreateFolder
              }
              onCancel={() => setCreating(null)}
              depth={depth + 1}
            />
          )}
          {item.children.map((child) => (
            <TreeItem
              key={child.id}
              item={child}
              selectedNote={selectedNote}
              onItemSelect={onItemSelect}
              onUpdateTitle={onUpdateTitle}
              onCreateFolder={onCreateFolder}
              onCreateNote={onCreateNote}
              onDeleteItem={onDeleteItem}
              depth={depth + 1}
              checkedIds={checkedIds}
              onCheckChange={onCheckChange}
              isDeleteMode={isDeleteMode}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// --- Filter Helper ---
const filterTree = (nodes, term) => {
  if (!term) return nodes;
  const lower = term.toLowerCase();
  return nodes.reduce((acc, node) => {
    const match = node.title.toLowerCase().includes(lower);
    if (node.type === 'folder') {
      const children = filterTree(node.children || [], term);
      if (match || children.length > 0)
        acc.push({ ...node, children: match ? node.children : children });
    } else if (match) acc.push(node);
    return acc;
  }, []);
};

// --- Main Sidebar Component ---
export function FileSidebar({
  notes,
  selectedNote,
  onItemSelect,
  onCreateNote,
  onCreateFolder,
  onUpdateTitle,
  onDeleteItem,
  onDeleteMultipleItems
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [creatingRoot, setCreatingRoot] = useState(null);

  const filtered = useMemo(() => filterTree(notes, searchTerm), [notes, searchTerm]);
  const hasNotes = notes?.length > 0;

  const handleCheckChange = (id) => {
    setCheckedIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handleBulkDelete = async () => {
    const flat = flattenNodes(notes);
    const items = flat.filter((n) => checkedIds.has(n.id));
    if (items.length === 0) return;
    await onDeleteMultipleItems(items);
    setCheckedIds(new Set());
    setDeleteMode(false);
  };

  return (
    <div className="p-4 flex flex-col h-full bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700/50">
      {/* Search & Delete Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md text-sm bg-gray-100 dark:bg-zinc-700/50 dark:text-white"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            {icons.search}
          </div>
        </div>
        <button
          onClick={() => setDeleteMode(true)}
          disabled={!hasNotes || deleteMode}
          title="Bulk delete"
          className={`p-2 rounded-md text-red-600 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900 ${deleteMode && 'opacity-50 cursor-not-allowed'}`}
        >
          {icons.trash}
        </button>
      </div>

      {/* Mode: Create or Delete */}
      {!deleteMode ? (
        <div className="flex gap-2 mb-4">
          <button onClick={() => setCreatingRoot('note')} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded py-2 text-sm font-semibold shadow">
            + Note
          </button>
          <button onClick={() => setCreatingRoot('folder')} className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded py-2 text-sm font-semibold shadow">
            + Folder
          </button>
        </div>
      ) : (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setDeleteMode(false); setCheckedIds(new Set()); }}
            className="flex-1 bg-gray-200 dark:bg-zinc-700 py-2 rounded text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={checkedIds.size === 0}
            className={`flex-1 py-2 rounded text-sm font-semibold text-white shadow ${checkedIds.size > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-red-400 cursor-not-allowed'}`}
          >
            Delete {checkedIds.size > 0 ? `(${checkedIds.size})` : ''}
          </button>
        </div>
      )}

      {/* Tree List */}
      <ul className="flex-1 overflow-y-auto">
        {creatingRoot && (
          <NewItemInput
            parentPath="."
            itemType={creatingRoot}
            onCreate={
              creatingRoot === 'note' ? onCreateNote :
              onCreateFolder
            }
            onCancel={() => setCreatingRoot(null)}
          />
        )}
        {filtered.map((item) => (
          <TreeItem
            key={item.id}
            item={item}
            selectedNote={selectedNote}
            onItemSelect={onItemSelect}
            onUpdateTitle={onUpdateTitle}
            onCreateFolder={onCreateFolder}
            onCreateNote={onCreateNote}
            onDeleteItem={onDeleteItem}
            depth={0}
            checkedIds={checkedIds}
            onCheckChange={handleCheckChange}
            isDeleteMode={deleteMode}
          />
        ))}
      </ul>
    </div>
  );
}