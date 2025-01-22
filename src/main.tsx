import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useToast } from "./hooks/use-toast";
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

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      console.log('ServiceWorker registration successful');
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Show toast notification for update
              const { toast } = useToast();
              toast({
                title: "Mise à jour disponible",
                description: "Une nouvelle version est disponible. La page va se recharger automatiquement.",
                duration: 5000,
              });
              
              // Reload after a short delay
              setTimeout(() => {
                window.location.reload();
              }, 5000);
            }
          };
        }
      };
    }).catch((error) => {
      console.error('ServiceWorker registration failed:', error);
    });
  });

  // Handle automatic reload when the new service worker takes control
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

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