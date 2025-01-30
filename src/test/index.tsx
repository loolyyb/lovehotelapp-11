import React from 'react';
import { createRoot } from 'react-dom/client';
import { TestApp } from './TestApp';
import '../index.css';

console.log('[Test index] Starting application initialization');

const container = document.getElementById('root');

if (!container) {
  console.error('[Test index] Root element not found');
  throw new Error('Root element not found');
}

console.log('[Test index] Root element found, creating root');
const root = createRoot(container);

console.log('[Test index] Rendering TestApp');
root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);