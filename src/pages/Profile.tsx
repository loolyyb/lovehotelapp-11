import React from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { ProfileTabs } from "@/components/profile/tabs/ProfileTabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { userProfile, loading } = useAuthSession();
  const { toast } = useToast();

  const handleUpdate = async (updates: any): Promise<void> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userProfile?.id);

      if (error) throw error;

      toast({
        title: "Profil mis à jour",
        description: "Vos modifications ont été enregistrées avec succès.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100 flex items-center justify-center">
        <div className="animate-pulse text-burgundy">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100">
      <div className="container mx-auto px-4 py-4">
        <ProfileTabs profile={userProfile} onUpdate={handleUpdate} />
      </div>
    </div>
  );
}