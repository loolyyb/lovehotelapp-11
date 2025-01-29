import { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AppContent } from "./components/layout/AppContent";
import { ServiceWorkerManager } from "./components/pwa/ServiceWorkerManager";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensure React is fully initialized before rendering content
    const initializeApp = async () => {
      await Promise.resolve();
      setIsReady(true);
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <ServiceWorkerManager />
          <AppContent />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;