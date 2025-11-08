import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';

// --- Toolbar Icons ---
const icons = {
  bold: (
    <svg width="1em" height="1em" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
      <path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
    </svg>
  ),
  italic: (
    <svg width="1em" height="1em" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  ),
  underline: (
    <svg width="1em" height="1em" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M6 15v3a6 6 0 006 6v0a6 6 0 006-6v-3" />
      <line x1="4" y1="21" x2="20" y2="21" />
    </svg>
  ),
  trash: (
    <svg width="1em" height="1em" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  ),
  check: (
    <svg width="1em" height="1em" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

// --- Toolbar ---
const MenuBar = ({ editor, onSave, onDelete, isNoteSelected, lastModified, createdAt }) => {
  if (!editor) return null;

  const fontOptions = [
    { label: 'Sans (Default)', value: 'sans-serif' },
    { label: 'Serif', value: 'serif' },
    { label: 'Monospace', value: 'monospace' },
    { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive, sans-serif' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Courier New', value: '"Courier New", monospace' },
    { label: 'Times New Roman', value: '"Times New Roman", serif' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
  ];

  const btn = (isActive) =>
    `p-2 h-9 rounded-xl transition-all duration-150 flex items-center justify-center
     ${
       isActive
         ? 'bg-blue-600 text-white shadow-md dark:bg-blue-500'
         : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-zinc-700'
     }`;

  const select =
    'px-3 h-9 rounded-lg text-sm bg-gray-100 dark:bg-zinc-800 border border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800 dark:text-gray-100';

  const getHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'H1';
    if (editor.isActive('heading', { level: 2 })) return 'H2';
    if (editor.isActive('heading', { level: 3 })) return 'H3';
    return 'Normal';
  };

  return (
    <div className="flex justify-between items-center px-6 py-3 border-b border-gray-200 dark:border-zinc-700
                    backdrop-blur-lg bg-white/60 dark:bg-zinc-900/50 sticky top-0 z-10 shadow-sm">

      {/* LEFT — Formatting tools */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Heading selector */}
        <select
          className={select}
          value={getHeading()}
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'Normal') editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: parseInt(val[1]) }).run();
          }}
        >
          <option value="Normal">Normal</option>
          <option value="H1">Heading 1</option>
          <option value="H2">Heading 2</option>
          <option value="H3">Heading 3</option>
        </select>

        {/* Font Family selector */}
        <select
          className={select}
          defaultValue="sans-serif"
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
        >
          {fontOptions.map((f) => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
              {f.label}
            </option>
          ))}
        </select>

        <button title="Bold (Ctrl+B)" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))}>
          {icons.bold}
        </button>
        <button title="Italic (Ctrl+I)" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))}>
          {icons.italic}
        </button>
        <button title="Underline (Ctrl+U)" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive('underline'))}>
          {icons.underline}
        </button>
      </div>

      {/* RIGHT — Minimal timestamps + Save/Delete */}
      {isNoteSelected && (
        <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
          <div className="hidden sm:flex flex-col items-end gap-0.5 leading-tight tracking-wide">
            {createdAt && (
              <span className="flex items-center gap-1 text-[0.8rem] opacity-70">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l3 3" />
                </svg>
                <span>{createdAt}</span>
              </span>
            )}
            {lastModified && (
              <span className="flex items-center gap-1 text-[0.8rem] opacity-60">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
                <span>{lastModified}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDelete}
              title="Delete note"
              className="p-2 rounded-xl text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
            >
              {icons.trash}
            </button>

            <button
              onClick={onSave}
              title="Save note"
              className="p-2 rounded-xl text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all"
            >
              {icons.check}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Editor Component ---
export function Editor({ content, onChange, onSave, onDelete, isNoteSelected, selectedNote }) {
  const [lastModified, setLastModified] = useState(null);
  const [createdAt, setCreatedAt] = useState(selectedNote?.createdAt || null);

  useEffect(() => {
    setCreatedAt(selectedNote?.createdAt || null);
  }, [selectedNote]);

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Underline,
        TextStyle,
        FontFamily.configure({
          types: ['textStyle'],
        }),
      ],
      content: typeof content === 'string' ? content : '',
      editable: isNoteSelected,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
        setLastModified(
          new Date().toLocaleString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        );
      },
      editorProps: {
        attributes: {
          class:
            'prose prose-gray dark:prose-invert max-w-none focus:outline-none text-[1.08rem] leading-[1.75] font-[450] tracking-wide w-full h-full px-10 py-6 sm:px-16 sm:py-12',
        },
      },
    },
    [isNoteSelected]
  );

  useEffect(() => {
    if (
      editor &&
      isNoteSelected &&
      typeof content === 'string' &&
      content !== editor.getHTML()
    ) {
      editor.commands.setContent(content || '', false);
    }
  }, [content, isNoteSelected, editor]);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 relative overflow-y-auto">
      {isNoteSelected && editor && (
        <MenuBar
          editor={editor}
          onSave={onSave}
          onDelete={onDelete}
          isNoteSelected={isNoteSelected}
          lastModified={lastModified}
          createdAt={createdAt}
        />
      )}

      <div className="flex-1 w-full">
        {isNoteSelected && editor ? (
          <EditorContent editor={editor} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="text-center">
              <p className="text-xl font-light mb-2">No note selected</p>
              <p className="text-sm opacity-70">Choose or create a new note to begin writing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Editor;
