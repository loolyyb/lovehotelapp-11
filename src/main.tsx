import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// S'assurer que l'élément DOM existe
const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found. Please check your index.html file.');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);