
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
    let isMounted = true;
    
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
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    ensureAdminPasswordExists();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const checkPassword = async () => {
    if (!password.trim()) {
      setError("Veuillez entrer un mot de passe");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      logger.info("Starting password verification process");
      
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

  // Show loading state while initializing with a soft transition
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#40192C] to-[#CE0067]/50 transition-opacity duration-500">
        <Card className="w-full max-w-md p-6 bg-[#302234] border-[#f3ebad]/20 shadow-lg">
          <div className="text-center text-[#f3ebad] flex items-center justify-center space-x-3">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Initialisation en cours...</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#40192C] to-[#CE0067]/50 opacity-100 transition-opacity duration-500">
      <Card className="w-full max-w-md p-6 space-y-4 bg-[#302234] border-[#f3ebad]/20 shadow-lg">
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
            autoFocus
          />
          
          <Button
            onClick={checkPassword}
            className="w-full bg-[#f3ebad] text-[#40192C] hover:bg-[#f3ebad]/90 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Vérification..." : "Accéder au panneau"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
