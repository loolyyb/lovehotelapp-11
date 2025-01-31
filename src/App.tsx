import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AppContent } from "./components/layout/AppContent";
import { ServiceWorkerManager } from "./components/pwa/ServiceWorkerManager";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Log application version and React version for debugging
console.log("React version:", React.version);
console.log("Application version:", process.env.npm_package_version || "1.0.0");

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