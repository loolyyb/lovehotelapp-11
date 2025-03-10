import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { verifyPassword, updateAdminPassword } from "@/utils/crypto";
import { useToast } from "@/hooks/use-toast";
import { AlertService } from "@/services/AlertService";
import { logger } from '@/services/LogService';

interface AdminPasswordCheckProps {
  onPasswordValid: () => void;
}

export function AdminPasswordCheck({ onPasswordValid }: AdminPasswordCheckProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // When component mounts, ensure admin password exists
  useEffect(() => {
    const ensureAdminPasswordExists = async () => {
      try {
        logger.info("Checking for admin password hash");
        
        const { data: adminSettings, error: settingsError } = await supabase
          .from('admin_settings')
          .select('value')
          .eq('key', 'admin_password_hash')
          .single();

        if (settingsError) {
          logger.warn("Admin password hash not found, creating default");
          // If no admin password hash found, set the default one
          await updateAdminPassword();
          logger.info("Default admin password created");
        } else {
          logger.info("Admin password hash found");
        }
      } catch (err) {
        logger.error("Error during admin password initialization:", { error: err });
        AlertService.captureException(err as Error, {
          context: "AdminPasswordCheck.ensureAdminPasswordExists"
        });
      } finally {
        setIsInitializing(false);
      }
    };

    ensureAdminPasswordExists();
  }, []);

  const checkPassword = async () => {
    setIsLoading(true);
    setError(null);

    try {
      logger.info("Starting password verification process");
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Vous devez être connecté pour accéder à cette page");
      }

      // Get the current user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (profileError) {
        logger.error("Profile check error:", { error: profileError });
        AlertService.captureException(new Error("Admin profile check failed"), {
          context: "AdminPasswordCheck",
          error: profileError
        });
        throw new Error("Impossible de vérifier votre profil");
      }

      if (!profile || profile.role !== 'admin') {
        logger.warn("Non-admin access attempt", { userId: session.user.id });
        throw new Error("Vous n'avez pas les droits pour accéder à cette page");
      }

      // Get admin password hash
      const { data: adminSettings, error: settingsError } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'admin_password_hash')
        .single();
      
      if (settingsError) {
        logger.error("Failed to retrieve admin password hash:", { error: settingsError });
        throw new Error("Impossible de récupérer les paramètres d'admin");
      }

      if (!adminSettings?.value?.hash) {
        logger.error("Admin password hash is missing");
        throw new Error("Configuration admin incorrecte");
      }

      const isValid = verifyPassword(password, adminSettings.value.hash);
      
      if (isValid) {
        logger.info("Admin password verified successfully");
        toast({
          title: "Accès accordé",
          description: "Bienvenue dans le panneau d'administration"
        });
        onPasswordValid();
      } else {
        logger.warn("Invalid admin password attempt");
        throw new Error("Mot de passe incorrect");
      }
    } catch (error: any) {
      logger.error("Auth error:", { error });
      setError(error.message || "Une erreur est survenue");
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: error.message || "Une erreur est survenue"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#40192C] to-[#CE0067]/50">
        <Card className="w-full max-w-md p-6 bg-[#302234] border-[#f3ebad]/20">
          <div className="text-center text-[#f3ebad]">
            Initialisation en cours...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#40192C] to-[#CE0067]/50">
      <Card className="w-full max-w-md p-6 space-y-4 bg-[#302234] border-[#f3ebad]/20">
        <h2 className="text-2xl font-bold text-center text-[#f3ebad]">
          Panneau d'Administration
        </h2>
        <p className="text-[#f3ebad]/80 text-center">
          Entrez le mot de passe pour accéder au panneau d'administration
        </p>
        
        {error && (
          <div className="p-3 my-2 text-sm text-red-500 bg-red-100/10 rounded">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Mot de passe administrateur"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#f3ebad]/5 text-[#f3ebad] border-[#f3ebad]/20"
            onKeyDown={(e) => e.key === "Enter" && checkPassword()}
          />
          
          <Button
            onClick={checkPassword}
            className="w-full bg-[#f3ebad] text-[#40192C] hover:bg-[#f3ebad]/90"
            disabled={isLoading}
          >
            {isLoading ? "Vérification..." : "Accéder au panneau"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
