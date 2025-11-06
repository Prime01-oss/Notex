import React from 'react';
import { Tldraw, useEditor } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import useResizeObserver from 'use-resize-observer'; // Corrected default import
import { NodeViewWrapper } from '@tiptap/react';

// --- Tldraw React Component ---

const TldrawBlock = ({ node, updateAttributes }) => {
  // Use width and height directly from node attributes
  const { width = 500, height = 300, data } = node.attrs;

  // Use the hook to track size of the resizable container
  // NOTE: This MUST be a default import for this library.
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
    // Load data from the Tiptap node attribute if available
    if (data && data !== '{}') {
      try {
        tldrawEditor.store.loadSnapshot(JSON.parse(data));
      } catch (e) {
        console.error("Failed to load tldraw snapshot:", e);
      }
    }
  };

  const handlePersist = (tldrawEditor) => {
    // Extract current state and save it back to the Tiptap node attribute
    const snapshot = tldrawEditor.store.getSnapshot();
    
    // IMPORTANT: Save the entire Tldraw state as a string in the Tiptap node
    updateAttributes({
      data: JSON.stringify(snapshot),
    });
  };

  const handleResizeEnd = (editor, type) => {
    // Only save the new size if the observed dimensions are different from the saved dimensions
    if (observedWidth !== width || observedHeight !== height) {
        updateAttributes({ 
            width: observedWidth, 
            height: observedHeight, 
        });
    }
  };
    // Tiptap's NodeViewWrapper is the outermost element for the component.
    // It must be connected to the Prosemirror DOM node.

  return (
    // NodeViewWrapper provides the essential Tiptap DOM node. 
    // data-drag-handle allows the user to click and drag the block.
    // data-resize-handle will tell Tiptap/ProseMirror how to handle the resizing.
    <NodeViewWrapper className="tldraw-container flex justify-center py-4" data-drag-handle>
        <div 
          // 💡 CRITICAL: The ref from useResizeObserver needs to be on the DOM element 
          // that defines the size, which is this inner wrapper.
          ref={resizeRef}
          // The size is dynamically controlled by node attributes
          style={{ width: `${width}px`, height: `${height}px` }}
          className="relative resize-x cursor-grab rounded-lg overflow-hidden shadow-2xl"
        >
          {/* Tldraw Editor Instance */}
          <Tldraw
            persistenceKey={node.attrs.id} // Ensures instance isolation
            forceMobile={false}
            onMount={handleMount}
            onPersist={handlePersist}
            onResize={handleResizeEnd}
            theme={NotexTheme} 
            // The key forces a remount when the block ID changes (though unlikely here)
            key={node.attrs.id}
          />
        </div>
    </NodeViewWrapper>
  );
};

export default TldrawBlock;