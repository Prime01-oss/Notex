// src/components/Editor.jsx

import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
// Import the necessary extensions
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
// NEW: Import the Tldraw Extension
import { TldrawExtension } from '../extensions/TldrawExtension'; 


// --- Professional Icons for the MenuBar (Pen Icon Replaced) ---
const toolbarIcons = {
    bold: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" /><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg>,
    italic: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>,
    underline: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 15v3a6 6 0 006 6v0a6 6 0 006-6v-3" /><line x1="4" y1="21" x2="20" y2="21" /></svg>,
    // 💡 FIX: Replaced complex "sketch" icon with a simple "pen" icon
    sketch: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>, 
};


// --- MenuBar Component (NOW INCLUDES SAVE/DELETE ACTIONS) ---
// 💡 FIX: Added onSave, onDelete, and isNoteSelected as props
const MenuBar = ({ editor, onSave, onDelete, isNoteSelected }) => {
    if (!editor) {
        return null;
    }
    
    // Helper to apply common Tailwind button styles
    const buttonClass = (isActive) => 
        `p-2 h-9 rounded transition-colors flex items-center justify-center 
        ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-zinc-700/50'}`;
        
    // Styling for dropdowns to make them look integrated
    const selectClass = `px-2 h-9 rounded text-sm bg-zinc-700 text-gray-200 border-none focus:ring-2 focus:ring-blue-500 cursor-pointer`;


    // Helper to get font size (currently only checking for heading levels)
    const getActiveHeading = () => {
        if (editor.isActive('heading', { level: 1 })) return 'H1';
        if (editor.isActive('heading', { level: 2 })) return 'H2';
        if (editor.isActive('heading', { level: 3 })) return 'H3';
        return 'Normal';
    };

    return (
        // 💡 FIX: Changed layout to justify-between to push action buttons to the far right.
        <div className="flex justify-between items-center px-6 py-2 border-b border-zinc-700 bg-zinc-800">
            
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
                            editor.chain().focus().toggleHeading({ level }).run();
                        }
                    }}
                >
                    <option value="Normal">Normal Text</option>
                    <option value="H1">Heading 1 (Large)</option>
                    <option value="H2">Heading 2 (Medium)</option>
                    <option value="H3">Heading 3 (Small)</option>
                </select>

                {/* 2. Font Type Dropdown */}
                <select
                    className={selectClass}
                    value={editor.getAttributes('textStyle').fontFamily || 'sans'}
                    onChange={(e) => {
                        if (e.target.value === 'sans') {
                            editor.chain().focus().unsetFontFamily().run();
                        } else {
                            editor.chain().focus().setFontFamily(e.target.value).run();
                        }
                    }}
                >
                    <option value="sans">Default Sans</option>
                    <option value="serif">Serif</option>
                    <option value="monospace">Monospace (Code)</option>
                </select>
                
                <div className="w-px h-6 bg-zinc-700 mx-1"></div> {/* Separator */}

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

                <div className="w-px h-6 bg-zinc-700 mx-1"></div> {/* Separator */}
                
                {/* Insert Tldraw Sketch Button (Now shows a pen icon) */}
                <button
                    onClick={() => editor.chain().focus().insertTldraw().run()}
                    className={buttonClass(editor.isActive('tldraw'))}
                    title="Insert Tldraw Sketch"
                >
                    {toolbarIcons.sketch}
                </button>
            </div>
            
            {/* RIGHT SIDE: Delete and Save Buttons (Visible only if isNoteSelected) */}
            {isNoteSelected && (
                <div className="flex items-center gap-4 flex-shrink-0">
                    {/* Delete button: Enhanced hover for better feedback */}
                    {onDelete && (
                    <button
                        onClick={onDelete}
                        className="no-drag px-4 py-1.5 bg-red-700 rounded text-white font-semibold text-sm transition-colors hover:bg-red-600 shadow-lg"
                        title="Delete Note"
                    >
                        Delete
                    </button>
                    )}
                    {/* Save button */}
                    <button
                        onClick={onSave}
                        disabled={!isNoteSelected}
                        className={`no-drag px-4 py-1.5 rounded text-white font-bold text-sm transition-colors shadow-lg
                                    ${isNoteSelected ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 cursor-not-allowed'}`}
                        title="Save Note"
                    >
                        Save
                    </button>
                </div>
            )}
        </div>
    );
};


// --- Main Editor Component (UPDATED to use new MenuBar props) ---
export function Editor({ content, onChange, onSave, onDelete, isNoteSelected }) {
    
    // Tiptap's useEditor hook
    const editor = useEditor({
        // ... (extensions remain the same) ...
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            FontFamily.configure({
                types: ['textStyle'],
                fonts: [
                    'sans', // Default setting
                    'serif', // Added font option
                    'monospace', // Added font option
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
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px]',
            },
        },
    }, [isNoteSelected]);
    
    // Effect to update the editor content when selectedNote changes externally
    React.useEffect(() => {
        if (editor && isNoteSelected && content !== editor.getHTML()) {
            // Use setContent with preserveCursor: false when switching notes
            editor.commands.setContent(content || '', false, { preserveCursor: false });
        }
    }, [content, isNoteSelected, editor]);


    return (
        <div className="flex-1 flex flex-col bg-zinc-900 relative">

            {/* 💡 FIX: Pass action props (onSave, onDelete, isNoteSelected) to MenuBar */}
            {isNoteSelected && editor && (
                <MenuBar 
                    editor={editor}
                    onSave={onSave}
                    onDelete={onDelete}
                    isNoteSelected={isNoteSelected}
                />
            )}
            
            {/* 1. Content Area (Tiptap Editor) */}
            <div className="flex-1 overflow-y-auto p-0"> 
                <div className={`w-full`}>
                    {isNoteSelected && editor ? (
                        <div className="min-h-full bg-zinc-900 p-6"> 
                            <EditorContent editor={editor} />
                        </div>
                    ) : (
                        // Placeholder message for empty state
                        <p className="text-center mt-20 text-xl font-light text-gray-500 italic flex items-center justify-center space-x-2">
                            <span>Select a note from the</span>
                            <span className="inline-flex items-center text-blue-400 font-semibold not-italic">
                                {/* File Icon SVG */}
                                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                                <span className="ml-1">Files</span>
                            </span>
                            <span>to begin editing, or create a new one.</span>
                        </p>
                    )}
                </div>
            </div>

            {/* 2. Fixed Bottom Toolbar is REMOVED */}
            {/* The bottom area will now be clean */}
        </div>
    );
}

export default Editor;