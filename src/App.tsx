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
import { useToast } from "./components/ui/use-toast";

function AppContent() {
  const { session, loading, userProfile } = useAuthSession();
  const isMobile = useIsMobile();
  const { currentThemeName, switchTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    const initTheme = async () => {
      try {
        // Set lover theme by default
        await switchTheme("lover");
      } catch (error) {
        console.error("Erreur lors du changement de thème:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le thème. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    };

    if (session) {
      initTheme();
    }
  }, [session, switchTheme, toast]);

  if (loading) {
    return <div>Chargement...</div>;
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
      {appConfig.features.enablePWA && <MobileNavBar />}
      <Toaster />
    </div>
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