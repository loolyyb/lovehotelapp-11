
import React from "react";
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
import { Loader } from "lucide-react";
import { InstallPrompt } from './components/pwa/InstallPrompt';
import { UpdatePrompt } from './components/pwa/UpdatePrompt';

const isPreviewEnvironment = () => {
  const hostname = window.location.hostname;
  console.log("Current hostname:", hostname);
  const isPreview = hostname.includes('preview--') && hostname.endsWith('.lovable.app');
  console.log("Is preview environment:", isPreview);
  return isPreview;
};

function PreviewContent() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Mode Preview</h1>
        <p className="text-lg text-gray-600">Cette page est en mode preview</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { session, loading, userProfile } = useAuthSession();
  const isMobile = useIsMobile();

  if (loading && !isPreviewEnvironment()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full overflow-x-hidden flex flex-col bg-background text-foreground transition-colors duration-300 ${isMobile ? "pb-20" : ""}`}>
      {!isPreviewEnvironment() && session && <Header userProfile={userProfile} />}
      <div className={`flex-grow ${!isPreviewEnvironment() && session ? "pt-[4.5rem]" : ""}`}>
        <AppRoutes session={session} />
      </div>
      <Footer />
      {appConfig.features.enablePWA && !isPreviewEnvironment() && (
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
  
  if (isPreviewEnvironment()) {
    return <PreviewContent />;
  }

  const basename = isPreviewEnvironment() 
    ? `/${window.location.hostname.split('--')[1].split('.')[0]}`
    : '/';

  return (
    <ThemeProvider>
      <Router basename={basename}>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
