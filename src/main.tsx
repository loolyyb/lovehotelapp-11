
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

// Fonction pour détecter l'environnement de preview
const isPreviewEnvironment = () => {
  const hostname = window.location.hostname;
  return hostname.includes('preview--') && hostname.endsWith('.lovable.app');
};

// Initialize Sentry only if not in preview
if (!isPreviewEnvironment()) {
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
}

// Create a client with preview-specific settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: isPreviewEnvironment() ? 0 : 1, // Disable retries in preview
      enabled: !isPreviewEnvironment(), // Disable automatic data fetching in preview
    },
  },
});

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the "root" element');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

// Nettoyage des service workers existants en mode preview
if (isPreviewEnvironment() && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
      console.log('Service Worker désinscrit pour la preview');
    }
  });
} 
// Enregistrement du Service Worker uniquement en production
else if ('serviceWorker' in navigator && !isPreviewEnvironment()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker enregistré avec succès:', registration);
      })
      .catch(error => {
        console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
      });
  });
}
