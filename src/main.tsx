import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import './index.css';

// Get the root element and create root first
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

// Create React root
const root = createRoot(container);

// Initialize Sentry
Sentry.init({
  dsn: "https://5c08652afca264d9e6bf17808b646ea9@o4508588731924480.ingest.de.sentry.io/4508588759973968",
  integrations: [
    new BrowserTracing({
      tracePropagationTargets: ["localhost", /^https:\/\/lovable\.dev/],
    }),
  ],
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE,
});

// Create a wrapped version of App with Sentry
const SentryWrappedApp = Sentry.withProfiler(App);

// Render the app
root.render(
  <SentryWrappedApp />
);