import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./integrations/supabase/client";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Profiles from "./pages/Profiles";
import ProfileDetails from "./pages/ProfileDetails";
import Landing from "./pages/Landing";
import { NavigationMenu } from "./components/navigation/NavigationMenu";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "./components/layout/Footer";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen w-full overflow-x-hidden flex flex-col">
        {session && <NavigationMenu />}
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
        </Routes>
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;