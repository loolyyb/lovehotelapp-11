import { Session } from "@supabase/supabase-js";
import { Header } from "./Header";
import { AppRoutes } from "./AppRoutes";
import { Footer } from "./Footer";
import { MobileNavBar } from "./MobileNavBar";
import { appConfig } from "@/config/app.config";
import { Toaster } from "@/components/ui/toaster";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainContentProps {
  session: Session | null;
  userProfile: any;
  currentThemeName: string;
}

export function MainContent({ session, userProfile, currentThemeName }: MainContentProps) {
  const isMobile = useIsMobile();

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