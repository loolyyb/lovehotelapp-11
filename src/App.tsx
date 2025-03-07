
import React, { useEffect, useRef } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { MobileNavBar } from "./components/layout/MobileNavBar";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "./components/layout/Footer";
import { useIsMobile } from "./hooks/use-mobile";
import { useAuthSession } from "./hooks/useAuthSession";
import { AppRoutes } from "./components/layout/AppRoutes";
import { ThemeProvider, useTheme } from "./providers/ThemeProvider";
import { appConfig } from "./config/app.config";
import { Loader, Info } from "lucide-react";
import { InstallPrompt } from './components/pwa/InstallPrompt';
import { UpdatePrompt } from './components/pwa/UpdatePrompt';
import { useStatusBar } from './hooks/useStatusBar';
import { useLogger } from './hooks/useLogger';
import { enableRealtimeSubscriptions } from "./utils/enableRealtimeSubscriptions";
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from "./integrations/supabase/client";

// Maintenance notification component for the index page
const MaintenanceNotification = () => (
  <div className="bg-[#f3ebad]/10 backdrop-blur-sm border border-[#f3ebad]/20 rounded-lg p-4 mb-4 mx-4 flex items-start gap-3">
    <Info className="text-[#f3ebad] w-5 h-5 mt-0.5 flex-shrink-0" />
    <p className="text-[#f3ebad]/90 text-sm">
      La messagerie fait actuellement l'objet d'une optimisation pour vous offrir une meilleure expérience. 
      Nos équipes y travaillent activement. Merci de votre patience !
    </p>
  </div>
);

function Content() {
  const { session, loading, userProfile } = useAuthSession();
  const isMobile = useIsMobile();
  const { currentThemeName } = useTheme();
  const { setStatusBarColor } = useStatusBar();
  const logger = useLogger('App');
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    logger.info("État de l'application", {
      sessionExists: !!session,
      loading,
      theme: currentThemeName,
      currentPath: window.location.pathname
    });
  }, [session, loading, currentThemeName]);

  useEffect(() => {
    if (isMobile) {
      setStatusBarColor();
    }
  }, [isMobile]);

  useEffect(() => {
    const setupRealtimeSubscriptions = async () => {
      if (session) {
        logger.info("Setting up realtime subscriptions", { userId: session.user.id });
        const channel = await enableRealtimeSubscriptions();
        realtimeChannelRef.current = channel;
      }
    };

    setupRealtimeSubscriptions();

    return () => {
      if (realtimeChannelRef.current) {
        logger.info("Cleaning up realtime subscriptions");
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [session, logger]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
        {/* Add the maintenance notification box at the top of the index page */}
        {!session && <div className="mt-4"><MaintenanceNotification /></div>}
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

function AppContent() {
  return (
    <ThemeProvider>
      <Content />
    </ThemeProvider>
  );
}

function App() {
  const logger = useLogger('App');
  const basename = getBasename();
  
  logger.info("Initialisation de l'application", {
    basename,
    fullPath: window.location.pathname,
    currentUrl: window.location.href
  });

  const router = createBrowserRouter([
    {
      path: "/*",
      element: <AppContent />,
    }
  ], {
    basename
  });

  return <RouterProvider router={router} />;
}

const getBasename = () => {
  const logger = useLogger('Router');
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  const isLovableEnv = hostname.includes('.lovable.') || hostname === 'localhost';
  
  logger.info('Environnement détecté', {
    hostname,
    pathname,
    isLovableEnv
  });

  if (isLovableEnv) {
    const firstSegment = pathname.split('/')[1];
    if (firstSegment) {
      logger.info('Basename Lovable détecté', { basename: `/${firstSegment}` });
      return `/${firstSegment}`;
    }
    logger.warn('Aucun segment de chemin trouvé dans un environnement Lovable');
  }
  
  logger.info('Utilisation du basename par défaut: /');
  return '/';
};

export default App;
