import React, { useMemo, useEffect, useRef } from 'react';
import {
  Tldraw,
  createTLStore,
  getSnapshot,
  loadSnapshot,
  DefaultToolbar,
  DefaultToolbarContent,
  TldrawUiMenuItem,
} from '@tldraw/tldraw';
import { throttle, debounce } from 'lodash';

/**
 * DrawingSpace
 * TLDraw canvas editor with persistent save & reload.
 */
export function DrawingSpace({ content, onChange, onSave, onDelete, theme }) {
  const isFileEditor = content !== undefined;
  const store = useMemo(() => createTLStore(), []);

  // Track whether content has been loaded for this file
  const hasLoadedRef = useRef(false);
  const prevContentRef = useRef(null);

  // 🧠 1. Reset when switching between canvases
  useEffect(() => {
    if (content !== prevContentRef.current) {
      hasLoadedRef.current = false;
      prevContentRef.current = content;
    }
  }, [content]);

  // 🧠 2. Load snapshot into TLDraw
  useEffect(() => {
    if (!isFileEditor || !content || hasLoadedRef.current) return;

    try {
      const data = typeof content === 'string' ? JSON.parse(content) : content;
      const snapshot = data?.store ? data : data?.content || null;

      if (snapshot && snapshot.store) {
        loadSnapshot(store, snapshot);
        hasLoadedRef.current = true;
        console.log('[TLDraw] Canvas loaded.');
      } else {
        console.warn('[TLDraw] Empty canvas loaded.');
      }
    } catch (err) {
      console.error('[TLDraw] Error parsing content:', err);
    }
  }, [content, isFileEditor, store]);

  // 🧠 3. Propagate changes up every 500ms
  useEffect(() => {
    if (!isFileEditor || !onChange) return;

    const throttled = throttle(() => {
      const snapshot = getSnapshot(store);
      onChange(snapshot);
    }, 500);

    const unsubscribe = store.listen(throttled, { scope: 'document' });
    return () => {
      unsubscribe();
      throttled.cancel();
    };
  }, [store, isFileEditor, onChange]);

  // 🧠 4. Manual Save
  const handleManualSave = () => {
    const snapshot = getSnapshot(store);
    if (onChange) onChange(snapshot);
    if (onSave) onSave(snapshot);
    console.log('[Manual Save] Canvas saved manually.');
  };

  // 🧠 5. Auto-save (10s after inactivity)
  useEffect(() => {
    if (!isFileEditor || !onSave) return;

    const debouncedAutoSave = debounce(() => {
      const snapshot = getSnapshot(store);
      onSave(snapshot);
      console.log('[AutoSave] Canvas saved automatically.');
    }, 10000);

    const listener = store.listen(() => debouncedAutoSave(), { scope: 'document' });
    return () => {
      listener();
      debouncedAutoSave.cancel();
    };
  }, [store, isFileEditor, onSave]);

  // 🧠 6. Toolbar UI
  const CustomToolbar = () => (
    <DefaultToolbar>
      {isFileEditor && (
        <>
          <TldrawUiMenuItem
            id="save"
            title="Save Canvas"
            icon="check"
            onSelect={handleManualSave}
          />
          <TldrawUiMenuItem
            id="delete"
            title="Delete Canvas"
            icon="trash"
            onSelect={() => onDelete?.()}
          />
        </>
      )}
      <DefaultToolbarContent />
    </DefaultToolbar>
  );

  // 🧠 7. Render TLDraw
  return (
    <div className="w-full h-full relative">
      <Tldraw
        store={store}
        forceUiDarkMode={theme === 'dark'}
        components={{
          Toolbar: CustomToolbar,
        }}
      />
    </div>
  );
}
