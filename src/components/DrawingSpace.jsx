import React from 'react';
import { Tldraw } from '@tldraw/tldraw';

// Use a named export to match your other components
export function DrawingSpace() {
  // We don't need to import the Tldraw CSS here
  // because you already import it in src/main.jsx
  return (
    <div className="w-full h-full relative">
      <Tldraw />
    </div>
  );
}