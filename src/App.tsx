import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./integrations/supabase/client";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Profiles from "./pages/Profiles";
import ProfileDetails from "./pages/ProfileDetails";
import Landing from "./pages/Landing";
import { Header } from "./components/layout/Header";
import { MobileNavBar } from "./components/layout/MobileNavBar";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "./components/layout/Footer";
import { useIsMobile } from "./hooks/use-mobile";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className={`min-h-screen w-full overflow-x-hidden flex flex-col ${isMobile ? "pb-20" : ""}`}>
        {session && <Header userProfile={userProfile} />}
        <div className="flex-grow pt-[4.5rem]">
          <Routes>
            <Route
              path="/"
              element={session ? <Profiles /> : <Landing />}
            />
            <Route
              path="/login"
              element={!session ? <Login /> : <Navigate to="/" replace />}
            />
            <Route
              path="/profile"
              element={session ? <Profile /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/profile/:id"
              element={session ? <ProfileDetails /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/lover-coin"
              element={<div className="p-8 text-center">Page LoverCoin en construction</div>}
            />
          </Routes>
        </div>
        <Footer />
        <MobileNavBar />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
