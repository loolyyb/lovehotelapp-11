
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

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

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
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

// Enregistrement du Service Worker avec options de mise en cache améliorées
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Attendre que l'application soit chargée pour enregistrer le service worker
    setTimeout(() => {
      navigator.serviceWorker.register('/sw.js', {
        // Limiter la portée du service worker
        scope: '/'
      })
        .then(registration => {
          console.log('Service Worker enregistré avec succès:', registration);
          
          // Limiter les mises à jour automatiques
          // Vérifier uniquement au démarrage, pas en continu
          registration.update();
        })
        .catch(error => {
          console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
        });
    }, 3000); // Attendre 3 secondes après le chargement
  });
}
