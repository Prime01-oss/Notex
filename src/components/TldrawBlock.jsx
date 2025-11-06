import React from 'react';
import { Tldraw, useEditor } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import useResizeObserver from 'use-resize-observer'; 
import { NodeViewWrapper } from '@tiptap/react';

// --- Tldraw React Component ---

const TldrawBlock = ({ node, updateAttributes }) => {
  // Use width and height directly from node attributes
  const { width = 500, height = 300, data } = node.attrs;

  // Use the hook to track size of the resizable container
  const { ref: resizeRef, width: observedWidth, height: observedHeight } = useResizeObserver();
  
  // Custom dark theme to match Notex UI (Unchanged)
  const NotexTheme = {
    color: {
      black: '#0a0a0a',
      white: '#fafafa',
    },
    style: {
      shadow: '0 0 0 1px #27272a, 0 1px 3px 0 #18181b',
      menuBackground: '#27272a',
      toolControlBackground: '#18181b',
      panelBackground: '#3f3f46',
    },
  };

  const handleMount = (tldrawEditor) => {
    if (data && data !== '{}') {
      try {
        tldrawEditor.store.loadSnapshot(JSON.parse(data));
      } catch (e) {
        console.error("Failed to load tldraw snapshot:", e);
      }
    }
  };

  const handlePersist = (tldrawEditor) => {
    const snapshot = tldrawEditor.store.getSnapshot();
    updateAttributes({
      data: JSON.stringify(snapshot),
    });
  };

  const handleResizeEnd = (editor, type) => {
    if (observedWidth !== width || observedHeight !== height) {
        updateAttributes({ 
            width: observedWidth, 
            height: observedHeight, 
        });
    }
  };
  
  // 💡 CRITICAL FIX: Stops mouse/keyboard events from reaching Tiptap/ProseMirror.
  const stopEventPropagation = (e) => {
    // This function stops the event from propagating up to the Tiptap editor instance.
    e.stopPropagation();
  }


  return (
    <NodeViewWrapper 
      className="tldraw-container flex justify-center py-4" 
      data-drag-handle
      // 🎯 APPLYING THE FIX: Stops mouse/click and keyboard input from being hijacked by Tiptap
      onMouseDown={stopEventPropagation}
      onKeyDown={stopEventPropagation}
    >
        <div 
          ref={resizeRef}
          style={{ width: `${width}px`, height: `${height}px` }}
          className="relative resize-x cursor-grab rounded-lg overflow-hidden shadow-2xl"
        >
          {/* Tldraw Editor Instance */}
          <Tldraw
            persistenceKey={node.attrs.id}
            forceMobile={false}
            onMount={handleMount}
            onPersist={handlePersist}
            onResize={handleResizeEnd}
            theme={NotexTheme} 
            key={node.attrs.id}
          />
        </div>
    </NodeViewWrapper>
  );
};

export default TldrawBlock;