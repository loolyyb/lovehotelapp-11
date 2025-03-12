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
import { Loader } from "lucide-react";
import { InstallPrompt } from './components/pwa/InstallPrompt';
import { UpdatePrompt } from './components/pwa/UpdatePrompt';
import { useStatusBar } from './hooks/useStatusBar';
import { useLogger } from './hooks/useLogger';
import { enableRealtimeSubscriptions } from "./utils/enableRealtimeSubscriptions";
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from "./integrations/supabase/client";

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
    currentUrl: window.location.href,
    origin: window.location.origin,
    host: window.location.host
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
  
  // Main domain shouldn't have a basename
  if (hostname === 'rencontre.lovehotelapp.com') {
    logger.info('Main domain detected, using empty basename');
    return '';
  }
  
  // Handle Lovable preview environments
  if (hostname.includes('.lovable.') || hostname === 'localhost') {
    logger.info('Lovable environment detected', { hostname });
    
    // Check if we're in a preview environment with a hash ID
    if (hostname.includes('preview--')) {
      // Extract the preview hash from the hostname (e.g., 'preview--abc123.lovable.app')
      const previewHash = hostname.split('--')[1]?.split('.')[0];
      if (previewHash) {
        logger.info('Preview environment with hash detected', { previewHash });
        return `/${previewHash}`;
      }
    }
    
    // If no preview ID or other special case, default to root
    logger.info('Using root basename for Lovable environment');
    return '';
  }
  
  // Default case for any other domain
  logger.info('Using default empty basename');
  return '';
};

export default App;
