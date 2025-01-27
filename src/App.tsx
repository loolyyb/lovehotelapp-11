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
import { supabase } from "./integrations/supabase/client";
import { UpdatePrompt } from "./components/pwa/UpdatePrompt";

function AppContent() {
  const { session, loading, userProfile } = useAuthSession();
  const isMobile = useIsMobile();
  const { currentThemeName, switchTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    const initTheme = async () => {
      try {
        if (!session) return;
        await switchTheme("lover");
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
  }, [session, switchTheme, toast]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'TOKEN_REFRESHED') {
        if (!session) {
          console.error("Token refresh failed - no session");
          toast({
            title: "Erreur de session",
            description: "Votre session a expiré. Veuillez vous reconnecter.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('supabase.auth.token');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

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
      {appConfig.features.enablePWA && <MobileNavBar />}
      <UpdatePrompt />
      <Toaster />
    </div>
  );
}

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