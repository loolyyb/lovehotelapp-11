
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase, safeQuerySingle } from "@/integrations/supabase/client";
import { verifyPassword, migratePassword } from "@/utils/crypto";
import { useToast } from "@/hooks/use-toast";
import { AlertService } from "@/services/AlertService";

interface AdminPasswordCheckProps {
  onPasswordValid: () => void;
}

export function AdminPasswordCheck({ onPasswordValid }: AdminPasswordCheckProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const checkPassword = async () => {
    setIsLoading(true);
    setError(null);

    try {
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
        AlertService.captureException(new Error("Admin profile check failed"), {
          context: "AdminPasswordCheck",
          error: profileError
        });
        throw new Error("Impossible de vérifier votre profil");
      }
      
      const typedProfile = safeQuerySingle<{ role: string }>(profile);
      
      if (!typedProfile) {
        throw new Error("Profil introuvable");
      }

      // Check if user is admin
      if (typedProfile.role !== 'admin') {
        AlertService.captureMessage("Non-admin attempted to access admin area", "warning", {
          userId: session.user.id
        });
        throw new Error("Vous n'avez pas les droits pour accéder à cette page");
      }

      // Get admin password hash from database
      const { data: adminSettings, error: settingsError } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'admin_password_hash')
        .single();
      
      if (settingsError) {
        AlertService.captureException(new Error("Failed to retrieve admin settings"), {
          context: "AdminPasswordCheck",
          error: settingsError
        });
        console.error("Failed to retrieve admin password hash:", settingsError);
      }
      
      // Default to hardcoded hash if no settings found
      // This hash should be for "Reussite888!" after running the script
      const ADMIN_PASSWORD_HASH = adminSettings?.value?.hash || "2c1743a391305fbf367df8e4f069f9f9";
      
      // Verify password using the crypto utility
      if (verifyPassword(password, ADMIN_PASSWORD_HASH)) {
        // If using the legacy hash, migrate to the new format
        if (!ADMIN_PASSWORD_HASH.includes(':')) {
          try {
            // Generate a new secure hash
            const newHash = migratePassword(password, ADMIN_PASSWORD_HASH);
            
            // Update the hash in the database
            const { error: updateError } = await supabase
              .from('admin_settings')
              .upsert({
                key: 'admin_password_hash',
                value: { hash: newHash },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, { onConflict: 'key' });
            
            if (updateError) {
              AlertService.captureException(new Error("Failed to update admin password hash"), {
                context: "AdminPasswordCheck.migrationUpdate",
                error: updateError
              });
              console.error("Failed to migrate password:", updateError);
            } else {
              console.log("Successfully migrated admin password to secure hash");
              AlertService.captureMessage("Admin password migrated to secure hash", "info");
            }
          } catch (migrationError: any) {
            console.error("Failed to migrate password:", migrationError);
            AlertService.captureException(migrationError, {
              context: "AdminPasswordCheck.migration"
            });
            // Continue even if migration fails
          }
        }
        
        toast({
          title: "Accès accordé",
          description: "Bienvenue dans le panneau d'administration"
        });
        onPasswordValid();
      } else {
        AlertService.captureMessage("Failed admin login attempt", "warning", {
          userId: session.user.id
        });
        throw new Error("Mot de passe incorrect");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
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
