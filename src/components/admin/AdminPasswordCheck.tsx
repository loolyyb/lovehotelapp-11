
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuthStore } from "@/stores/adminAuthStore";
import { supabase } from "@/integrations/supabase/client";

interface AdminPasswordCheckProps {
  onPasswordValid: () => void;
}

export function AdminPasswordCheck({ onPasswordValid }: AdminPasswordCheckProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const setAdminAuthenticated = useAdminAuthStore((state) => state.setAdminAuthenticated);

  const verifyAdminRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return false;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      console.error("Error checking admin role:", error);
      return false;
    }

    return profile?.role === 'admin';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isAdmin = await verifyAdminRole();
      
      if (!isAdmin) {
        toast({
          title: "Erreur",
          description: "Vous n'avez pas les droits administrateur nécessaires.",
          variant: "destructive",
        });
        return;
      }

      if (password === "Reussite888!") {
        console.log("Admin password correct and role verified");
        setAdminAuthenticated(true);
        onPasswordValid();
        toast({
          title: "Succès",
          description: "Vous êtes connecté en tant qu'administrateur",
        });
      } else {
        console.log("Admin password incorrect");
        toast({
          title: "Erreur",
          description: "Mot de passe incorrect",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during admin authentication:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'authentification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">Accès Administrateur</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe administrateur"
              className="w-full"
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Vérification..." : "Connexion"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
