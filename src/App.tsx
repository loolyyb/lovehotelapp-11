
import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { MobileNavBar } from "./components/layout/MobileNavBar";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "./components/layout/Footer";
import { useIsMobile } from "./hooks/use-mobile";
import { useAuthSession } from "./hooks/useAuthSession";
import { AppRoutes } from "./components/layout/AppRoutes";
import { ThemeProvider, useTheme } from "./providers/ThemeProvider";
import { appConfig } from "./config/app.config";
import { useToast } from "./hooks/use-toast";
import { Loader } from "lucide-react";
import { InstallPrompt } from './components/pwa/InstallPrompt';
import { UpdatePrompt } from './components/pwa/UpdatePrompt';
import { StatusBar } from '@capacitor/status-bar';

// Fonction utilitaire pour détecter l'environnement de preview
const getBasename = () => {
  const hostname = window.location.hostname;
  const isPreview = hostname.includes('preview--') && hostname.endsWith('.lovable.app');
  if (isPreview) {
    // Extrait le nom du projet de l'URL de preview (ex: preview--project-name.lovable.app)
    const projectName = hostname.split('--')[1].split('.')[0];
    console.log('Preview environment detected, basename:', `/${projectName}`);
    return `/${projectName}`;
  }
  console.log('Production environment detected, basename: /');
  return '/';
};

async function setStatusBarColor(color: string) {
  try {
    await StatusBar.setBackgroundColor({ color });
  } catch (error) {
    console.log('Status bar color setting failed - probably not on mobile', error);
  }
}

function AppContent() {
  const { session, loading, userProfile } = useAuthSession();
  const isMobile = useIsMobile();
  const { currentThemeName, theme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    console.log("AppContent mounted");
    console.log("Session:", session);
    console.log("Loading:", loading);
    console.log("Current theme:", currentThemeName);
  }, [session, loading, currentThemeName]);

  useEffect(() => {
    const initTheme = async () => {
      try {
        if (!session) return;
        await setStatusBarColor(theme.colors.statusBar);
      } catch (error) {
        console.error("Erreur lors du changement de thème:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le thème. Veuillez vous connecter et réessayer.",
          variant: "destructive",
        });
      }
    };

    initTheme();
  }, [session, theme.colors.statusBar, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div 
      data-theme={currentThemeName} 
      className={`min-h-screen w-full overflow-x-hidden flex flex-col bg-background text-foreground transition-colors duration-300 ${isMobile ? "pb-20" : ""}`}
    >
      {session && <Header userProfile={userProfile} />}
      <div className="flex-grow pt-[4.5rem]">
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
    <ThemeProvider>
      <Router basename={basename}>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
