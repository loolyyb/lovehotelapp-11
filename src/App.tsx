import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AppContent } from "./components/layout/AppContent";

function App() {
  return (
    <React.StrictMode>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </React.StrictMode>
  );
}

export default App;