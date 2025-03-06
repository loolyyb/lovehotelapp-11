
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase, safeQuerySingle } from "@/integrations/supabase/client";
import { hash } from "@/utils/crypto";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuthStore } from "@/stores/adminAuthStore";

export function AdminPasswordCheck() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { setAdminAuthenticated } = useAdminAuthStore();

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    
    if (!password) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer le mot de passe administrateur",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get admin profile by ID
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed')
        .single();

      if (error) {
        // Try to get admin by role
        const { data: adminProfile, error: adminError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'admin')
          .limit(1)
          .single();

        if (adminError) {
          throw new Error("Aucun administrateur trouvé");
        }

        const adminProfileData = safeQuerySingle(adminProfile);
        if (!adminProfileData || adminProfileData.role !== 'admin') {
          throw new Error("Profil administrateur invalide");
        }
      }

      // Check if password hash matches
      const hashedPassword = hash(password);
      if (hashedPassword === 'bc99586cd969f108cd85c4a7277aa4d890cf04e8' || hashedPassword === '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8') {
        setAdminAuthenticated(true);
        toast({
          title: "Connecté",
          description: "Vous êtes maintenant connecté en tant qu'administrateur",
        });
      } else {
        throw new Error("Mot de passe incorrect");
      }
    } catch (error: any) {
      console.error('Admin auth error:', error);
      toast({
        title: "Erreur d'authentification",
        description: error.message || "Une erreur est survenue lors de l'authentification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#40192C] p-6">
      <div className="bg-[#40192C]/60 border border-[#f3ebad]/20 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl text-[#f3ebad] font-bold mb-6 text-center">
          Espace Administrateur
        </h2>
        
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Mot de passe administrateur"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-[#f3ebad]/30 bg-[#40192C]/80 text-[#f3ebad]"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-[#f3ebad] text-[#40192C] hover:bg-[#f3ebad]/90"
            disabled={loading}
          >
            {loading ? "Vérification..." : "Accéder au Dashboard"}
          </Button>
        </form>
      </div>
    </div>
  );
}
