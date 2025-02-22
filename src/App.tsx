
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
  const { session, loading: sessionLoading, userProfile } = useAuthSession();
  const isMobile = useIsMobile();
  const { currentThemeName, switchTheme } = useTheme();
  const { toast } = useToast();
  const { setStatusBarColor } = useStatusBar();

  useEffect(() => {
    console.log("AppContent mounted");
    console.log("Session:", session);
    console.log("Loading:", sessionLoading);
    console.log("Current theme:", currentThemeName);
  }, [session, sessionLoading, currentThemeName]);

  useEffect(() => {
    const initTheme = async () => {
      try {
        // Appliquer le thème lover pour les utilisateurs connectés
        if (session) {
          await switchTheme("lover");
        } else {
          // Toujours avoir un thème par défaut pour les utilisateurs non connectés
          await switchTheme("default");
        }
      } catch (error) {
        console.error("Erreur lors du changement de thème:", error);
        // En cas d'erreur, s'assurer qu'on a au moins le thème par défaut
        await switchTheme("default");
        toast({
          title: "Erreur",
          description: "Impossible de charger le thème personnalisé. Thème par défaut appliqué.",
          variant: "destructive",
        });
      }
    };

    initTheme();
  }, [session, switchTheme, toast]);

  useEffect(() => {
    if (isMobile) {
      setStatusBarColor();
    }
  }, [isMobile, currentThemeName]); // Ajout de currentThemeName comme dépendance

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div 
      data-theme={currentThemeName} 
      className={`min-h-screen w-full overflow-x-hidden flex flex-col bg-white transition-colors duration-300 ${isMobile ? "pb-20" : ""}`}
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
