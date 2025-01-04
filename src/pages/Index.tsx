import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";
import { Header } from "@/components/landing/Header";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/profile");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/profile");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <CTA />
    </main>
  );
};

export default Index;