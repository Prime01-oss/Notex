import React, { useEffect, useMemo } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';

export function ExcalidrawEditor({ content, onChange, onSave, onDelete, theme }) {
  
  // 1. We must parse the string 'content' into an object for Excalidraw.
  //    useMemo ensures this only happens when the content string changes.
  const initialData = useMemo(() => {
    try {
      // Parse the elements from the content string
      const elements = JSON.parse(content || '[]');
      return { elements };
    } catch (e) {
      console.error("Failed to parse canvas content", e);
      return { elements: [] };
    }
  }, [content]); // Only re-parse when the 'content' prop changes

  // 2. This is called by Excalidraw whenever the user makes a change
  const handleExcalidrawChange = (elements) => {
    // We convert the elements array back into a JSON string
    const newContent = JSON.stringify(elements);
    // And pass it up to App.jsx to store in 'currentNoteContent'
    onChange(newContent);
  };
  
  // 3. We use onPointerUp (when the user stops drawing/moving)
  //    as a trigger to save the file.
  const handlePointerUp = () => {
    onSave();
  };

  return (
    // The relative wrapper is needed for the save/delete buttons
    <div className="w-full h-full relative">

      {/* Save and Delete buttons, positioned over the canvas */}
      <div className="absolute top-4 right-6 z-10 flex gap-4">
        <button
          onClick={onDelete}
          className="no-drag px-4 py-1.5 bg-red-600 rounded text-white font-semibold text-sm transition-colors hover:bg-red-700 shadow-lg"
          title="Delete Canvas"
        >
          Delete
        </button>
        <button
          onClick={onSave}
          className="no-drag px-4 py-1.5 bg-blue-600 rounded text-white font-bold text-sm transition-colors hover:bg-blue-500 shadow-lg"
          title="Save Canvas"
        >
          Save
        </button>
      </div>

      <Excalidraw
        // Pass the parsed data
        initialData={initialData}
        // Pass the theme (light/dark)
        theme={theme}
        // Set up the change handlers
        onChange={handleExcalidrawChange}
        onPointerUp={handlePointerUp}
        // We can hide the built-in save/load buttons
        UIOptions={{
          canvasActions: {
            saveAsImage: true,
            loadScene: false,
            export: false,
            clearCanvas: true,
          },
        }}
      />
    </div>
  );
}