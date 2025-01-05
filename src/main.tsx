import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import * as Sentry from "@sentry/react";
import "./index.css";

// Initialize Sentry
Sentry.init({
  dsn: "", // Vous devrez ajouter votre DSN Sentry ici
  integrations: [],
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE,
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);