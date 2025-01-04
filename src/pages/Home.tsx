import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";
import { Header } from "@/components/landing/Header";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/profile");
      }
    };

    checkSession();

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

export default Home;