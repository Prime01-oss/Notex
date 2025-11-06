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


// --- Professional Icons for the MenuBar (Added Sketch icon) ---
const toolbarIcons = {
    bold: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" /><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg>,
    italic: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>,
    underline: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 15v3a6 6 0 006 6v0a6 6 0 006-6v-3" /><line x1="4" y1="21" x2="20" y2="21" /></svg>,
    sketch: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 6v6l4 2"/></svg>, // Placeholder for a sketch/draw icon
};


// --- MenuBar Component (UPDATED with Sketch button) ---
const MenuBar = ({ editor }) => {
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
        <div className="flex flex-wrap items-center gap-2 px-6 py-2 border-b border-zinc-700 bg-zinc-800">
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
            
            {/* NEW: Insert Tldraw Sketch Button */}
            <button
                // Calls the custom Tiptap command defined in TldrawExtension.js
                onClick={() => editor.chain().focus().insertTldraw().run()}
                className={buttonClass(editor.isActive('tldraw'))}
                title="Insert Tldraw Sketch"
            >
                {toolbarIcons.sketch}
            </button>

        </div>
    );
};


// --- Main Editor Component (UPDATED with TldrawExtension) ---
export function Editor({ content, onChange, onSave, onDelete, isNoteSelected }) {
    
    // Tiptap's useEditor hook
    const editor = useEditor({
        // NEW: Add TldrawExtension to the list
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

            {/* Render the Toolbar if a note is selected and the editor is ready */}
            {isNoteSelected && editor && <MenuBar editor={editor} />}
            
            {/* 1. Content Area (Tiptap Editor) */}
            <div className="flex-1 overflow-y-auto p-0"> 
                <div className={`w-full`}>
                    {isNoteSelected && editor ? (
                        <div className="min-h-full bg-zinc-900 p-6"> 
                            <EditorContent editor={editor} />
                        </div>
                    ) : (
                        <p className="text-center mt-20 text-xl font-light text-gray-500 italic">
                            Select a note from the sidebar to begin editing, or create a new one.
                        </p>
                    )}
                </div>
            </div>

            {/* 2. Fixed Bottom Toolbar for Actions (Save/Delete) */}
            <div className="flex-shrink-0 flex justify-end gap-4 p-4 border-t border-zinc-800 bg-zinc-900/50">
                {/* Delete button: Enhanced hover for better feedback */}
                {onDelete && (
                <button
                    onClick={onDelete}
                    className="no-drag px-6 py-2 bg-red-700 rounded text-white font-semibold hover:bg-red-600 transition-colors shadow-lg"
                >
                    Delete
                </button>
                )}
                {/* Save button: Strong blue accent and shadow */}
                <button
                onClick={onSave}
                disabled={!isNoteSelected}
                className={`no-drag px-6 py-2 rounded text-white font-bold transition-colors shadow-lg
                            ${isNoteSelected ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 cursor-not-allowed'}`}
                >
                Save Note
                </button>
            </div>
        </div>
    );
}