import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Loader } from "lucide-react";
import { ThemeProvider, useTheme } from "./providers/ThemeProvider";
import { useAuthSession } from "./hooks/useAuthSession";
import { useThemeInit } from "./hooks/useThemeInit";
import { SessionManager } from "./components/auth/SessionManager";
import { MainContent } from "./components/layout/MainContent";

function AppContent() {
  const { session, loading, userProfile, refreshSession } = useAuthSession();
  const { currentThemeName } = useTheme();

  useThemeInit(session);

  if (loading) {
    console.log("App is loading...");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  console.log("App rendered with session:", session);
  return (
    <>
      <SessionManager refreshSession={refreshSession} />
      <MainContent 
        session={session}
        userProfile={userProfile}
        currentThemeName={currentThemeName}
      />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;