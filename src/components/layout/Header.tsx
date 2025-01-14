import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HeaderContainer } from "./header/HeaderContainer";
import { HeaderNavigation } from "./header/HeaderNavigation";
import { HeaderProfile } from "./header/HeaderProfile";
import { AuthError } from "@supabase/supabase-js";

interface HeaderProps {
  userProfile?: {
    avatar_url: string | null;
    full_name?: string;
  };
}

export function Header({ userProfile }: HeaderProps) {
  const [profile, setProfile] = useState<HeaderProps["userProfile"]>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger votre profil.",
        });
      }
    };

    if (!userProfile) {
      getProfile();
    }
  }, [navigate, toast, userProfile]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_OUT") {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      if (error instanceof AuthError) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors de la déconnexion.",
        });
      }
    }
  };

  const displayProfile = userProfile || profile;
  if (!displayProfile) return null;

  return (
    <HeaderContainer>
      <HeaderNavigation />
      <HeaderProfile profile={displayProfile} onLogout={handleLogout} />
    </HeaderContainer>
  );
}