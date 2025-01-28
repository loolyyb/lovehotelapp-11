import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AppContent } from "./components/layout/AppContent";
import { ServiceWorkerManager } from "./components/pwa/ServiceWorkerManager";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Router>
            <ServiceWorkerManager />
            <AppContent />
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;