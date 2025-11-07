import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
// Import the necessary extensions
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
// NEW: Import the Tldraw Extension
import { TldrawExtension } from '../extensions/TldrawExtension';


// --- Professional Icons for the MenuBar (omitted for brevity) ---
const toolbarIcons = {
    bold: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" /><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg>,
    italic: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>,
    underline: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 15v3a6 6 0 006 6v0a6 6 0 006-6v-3" /><line x1="4" y1="21" x2="20" y2="21" /></svg>,
    sketch: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
};


// --- MenuBar Component (omitted for brevity) ---
const MenuBar = ({ editor, onSave, onDelete, isNoteSelected }) => {
    if (!editor) {
        return null;
    }
    
    // 💡 Helper for theme-aware button styles
    const buttonClass = (isActive) =>
        `p-2 h-9 rounded transition-colors flex items-center justify-center
        ${isActive
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-600 dark:text-white'
            : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-zinc-700/50'
        }`;
        
    // 💡 Styling for theme-aware dropdowns
    const selectClass = `px-2 h-9 rounded text-sm 
                       bg-gray-100 text-gray-700 
                       dark:bg-zinc-700 dark:text-gray-200 
                       border border-gray-200 dark:border-transparent 
                       focus:ring-2 focus:ring-blue-500 cursor-pointer focus:outline-none`;


    // Helper to get font size (checking for heading levels)
    const getActiveHeading = () => {
        if (editor.isActive('heading', { level: 1 })) return 'H1';
        if (editor.isActive('heading', { level: 2 })) return 'H2';
        if (editor.isActive('heading', { level: 3 })) return 'H3';
        return 'Normal';
    };

    return (
        // Theme-aware MenuBar background and border
        <div className="flex justify-between items-center px-6 py-2 border-b 
                      bg-gray-50 border-gray-200 
                      dark:bg-zinc-800 dark:border-zinc-700">
            
            {/* LEFT SIDE: Formatting Controls */}
            <div className="flex flex-wrap items-center gap-2">
                {/* 1. Font Size / Heading Dropdown */}
                <select
                    className={selectClass}
                    value={getActiveHeading()}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'Normal') {
                            editor.chain().focus().setParagraph().run();
                        } else {
                            const level = parseInt(value.replace('H', ''));
                            // 💡 CORRECT TIPTAP COMMAND
                            editor.chain().focus().toggleHeading({ level }).run();
                        }
                    }}
                >
                    <option value="Normal">Normal Text</option>
                    <option value="H1">Heading 1</option>
                    <option value="H2">Heading 2</option>
                    <option value="H3">Heading 3</option>
                </select>

                {/* 2. Font Type Dropdown */}
                <select
                    className={selectClass}
                    value={editor.getAttributes('textStyle').fontFamily || 'sans'}
                    onChange={(e) => {
                        if (e.target.value === 'sans') {
                            // 💡 CORRECT TIPTAP COMMAND
                            editor.chain().focus().unsetFontFamily().run();
                        } else {
                            // 💡 CORRECT TIPTAP COMMAND
                            editor.chain().focus().setFontFamily(e.target.value).run();
                        }
                    }}
                >
                    <option value="sans">Default Sans</option>
                    <option value="serif">Serif</option>
                    <option value="monospace">Monospace</option>
                </select>
                
                {/* Theme-aware separator */}
                <div className="w-px h-6 bg-gray-300 dark:bg-zinc-700 mx-1"></div>

                {/* Formatting buttons */}
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={buttonClass(editor.isActive('bold'))}
                    title="Bold (Ctrl+B)"
                >
                    {toolbarIcons.bold}
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={buttonClass(editor.isActive('italic'))}
                    title="Italic (Ctrl+I)"
                >
                    {toolbarIcons.italic}
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={buttonClass(editor.isActive('underline'))}
                    title="Underline (Ctrl+U)"
                >
                    {toolbarIcons.underline}
                </button>

                {/* Theme-aware separator */}
                <div className="w-px h-6 bg-gray-300 dark:bg-zinc-700 mx-1"></div>
                
                {/* Insert Tldraw Sketch Button */}
                <button
                    onClick={() => editor.chain().focus().insertTldraw().run()}
                    className={buttonClass(editor.isActive('tldraw'))}
                    title="Insert Tldraw Sketch"
                >
                    {toolbarIcons.sketch}
                </button>
            </div>
            
            {/* RIGHT SIDE: Delete and Save Buttons */}
            {isNoteSelected && (
                <div className="flex items-center gap-4 flex-shrink-0">
                    {onDelete && (
                    <button
                        onClick={onDelete}
                        className="no-drag px-4 py-1.5 bg-red-600 rounded text-white font-semibold text-sm transition-colors hover:bg-red-700 shadow-lg"
                        title="Delete Note"
                    >
                        Delete
                    </button>
                    )}
                    {/* Save button: Consistent styling */}
                    <button
                        onClick={onSave}
                        disabled={!isNoteSelected}
                        className={`no-drag px-4 py-1.5 rounded text-white font-bold text-sm transition-colors shadow-lg
                                ${isNoteSelected ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-500 cursor-not-allowed'}`}
                        title="Save Note"
                    >
                        Save
                    </button>
                </div>
            )}
        </div>
    );
};


// --- Main Editor Component ---
export function Editor({ content, onChange, onSave, onDelete, isNoteSelected }) {
    
    // Tiptap's useEditor hook
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            // 💡 CRITICAL: TextStyle must be loaded BEFORE FontFamily
            TextStyle, 
            FontFamily.configure({
                types: ['textStyle'],
                fonts: [
                    'sans',
                    'serif',
                    'monospace',
                ],
            }),
            TldrawExtension,
        ],
        content: content,
        editable: isNoteSelected,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[400px]',
            },
        },
    }, [isNoteSelected]);
    
    // Effect to update the editor content when selectedNote changes externally
    React.useEffect(() => {
        if (editor && isNoteSelected && content !== editor.getHTML()) {
            editor.commands.setContent(content || '', false, { preserveCursor: false });
        }
    }, [content, isNoteSelected, editor]);


    return (
        // Theme-aware main container
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 relative">

            {/* Pass all required props to MenuBar */}
            {isNoteSelected && editor && (
                <MenuBar
                    editor={editor}
                    onSave={onSave}
                    onDelete={onDelete}
                    isNoteSelected={isNoteSelected}
                />
            )}
            
            {/* 1. Content Area (Tiptap Editor) */}
            {/* 💡 CHANGE 1: Added flex items-center justify-center */}
            <div className="flex-1 overflow-y-auto p-0 flex items-center justify-center">
                {/* 💡 CHANGE 2: Added h-full to this div */}
                <div className={`w-full h-full`}>
                    {isNoteSelected && editor ? (
                        <div className="min-h-full bg-white dark:bg-zinc-900 p-6">
                            <EditorContent editor={editor} />
                        </div>
                    ) : (
                        // 💡 This block is now wrapped in centering containers
                        <div className="w-full h-full flex items-center justify-center">
                            {/* 💡 CHANGE 3: Removed mt-20 */}
                            <p className="text-center text-xl font-light text-gray-400 dark:text-gray-400 not-italic flex items-center justify-center space-x-2">
                                <span>Select a note from the</span>
                                <span className="inline-flex items-center text-blue-400 dark:text-blue-400 font-semibold not-italic">
                                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                                    <span className="ml-1">Files</span>
                                </span>
                                <span>to begin editing, or create a new one.</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Editor;