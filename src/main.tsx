import React from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from "@sentry/react";
import App from './App';
import './index.css';

// Ensure the DOM element exists
const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found. Please check your index.html file.');
}

// Initialize Sentry after React is loaded
if (process.env.NODE_ENV === 'production') {
  console.log('Initializing Sentry...');
  Sentry.init({
    dsn: process.env.VITE_SENTRY_DSN,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

const root = createRoot(container);

// Wrap the app with Sentry only in production
const AppWithSentry = process.env.NODE_ENV === 'production' 
  ? Sentry.withProfiler(App)
  : App;

root.render(
  <React.StrictMode>
    <AppWithSentry />
  </React.StrictMode>
);