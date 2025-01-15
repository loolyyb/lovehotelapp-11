import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error('Error logging in:', error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-center text-burgundy">
          Connexion
        </h1>
        <p className="text-center text-gray-600">
          Connectez-vous pour accéder à votre compte
        </p>
        <div className="space-y-4">
          <Button 
            onClick={handleLogin}
            className="w-full"
          >
            Continuer avec Google
          </Button>
        </div>
      </Card>
    </div>
  );
}