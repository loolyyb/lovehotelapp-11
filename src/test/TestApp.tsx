import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TestComponent } from "./TestComponent";

console.log('TestApp: Starting initialization');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

console.log('TestApp: QueryClient initialized');

export function TestApp() {
  console.log('TestApp: Rendering component');
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <TestComponent />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}