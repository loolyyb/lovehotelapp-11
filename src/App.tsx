import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./integrations/supabase/client";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Profile from "./pages/Profile";

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
      <Routes>
        <Route
          path="/"
          element={session ? <Index /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={!session ? <Login /> : <Navigate to="/profile" replace />}
        />
        <Route
          path="/profile"
          element={session ? <Profile /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;