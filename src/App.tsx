
import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { MobileNavBar } from "./components/layout/MobileNavBar";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "./components/layout/Footer";
import { useIsMobile } from "./hooks/use-mobile";
import { useAuthSession } from "./hooks/useAuthSession";
import { AppRoutes } from "./components/layout/AppRoutes";
import { ThemeProvider } from "./providers/ThemeProvider";
import { appConfig } from "./config/app.config";
import { useToast } from "./hooks/use-toast";
import { Loader } from "lucide-react";
import { InstallPrompt } from './components/pwa/InstallPrompt';
import { UpdatePrompt } from './components/pwa/UpdatePrompt';
import { useStatusBar } from './hooks/useStatusBar';

// Fonction utilitaire pour détecter l'environnement de preview
const getBasename = () => {
  const hostname = window.location.hostname;
  const isPreview = hostname.includes('preview--') && hostname.endsWith('.lovable.app');
  if (isPreview) {
    const projectName = hostname.split('--')[1].split('.')[0];
    console.log('Preview environment detected, basename:', `/${projectName}`);
    return `/${projectName}`;
  }
  console.log('Production environment detected, basename: /');
  return '/';
};

function AppContent() {
  const { session, loading, userProfile } = useAuthSession();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { setStatusBarColor } = useStatusBar();

  useEffect(() => {
    console.log("AppContent mounted");
    console.log("Session:", session);
    console.log("Loading:", loading);
  }, [session, loading]);

  useEffect(() => {
    if (isMobile) {
      setStatusBarColor();
    }
  }, [isMobile, setStatusBarColor]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-background text-foreground">
      {session && userProfile ? (
        <Header userProfile={userProfile} />
      ) : (
        <div className="h-16" /> // Espace réservé pour le header de la landing page
      )}
      <div className={session ? "flex-grow pt-[4.5rem]" : "flex-grow"}>
        <AppRoutes session={session} />
      </div>
      <Footer />
      {appConfig.features.enablePWA && (
        <>
          <MobileNavBar />
          <InstallPrompt />
          <UpdatePrompt />
        </>
      )}
      <Toaster />
    </div>
  );
}

function App() {
  console.log("App component rendering");
  const basename = getBasename();
  console.log("Using basename:", basename);

  return (
    <ThemeProvider defaultTheme="lover" forcedTheme="lover">
      <Router basename={basename}>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
