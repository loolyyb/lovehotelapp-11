import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AppContent } from "./components/layout/AppContent";
import { ServiceWorkerManager } from "./components/pwa/ServiceWorkerManager";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ServiceWorkerManager />
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;