import { BrowserRouter as Router } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { MobileNavBar } from "./components/layout/MobileNavBar";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "./components/layout/Footer";
import { useIsMobile } from "./hooks/use-mobile";
import { useAuthSession } from "./hooks/useAuthSession";
import { AppRoutes } from "./components/layout/AppRoutes";

function App() {
  const { session, loading, userProfile } = useAuthSession();
  const isMobile = useIsMobile();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className={`min-h-screen w-full overflow-x-hidden flex flex-col ${isMobile ? "pb-20" : ""}`}>
        {session && <Header userProfile={userProfile} />}
        <div className="flex-grow pt-[4.5rem]">
          <AppRoutes session={session} />
        </div>
        <Footer />
        <MobileNavBar />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;