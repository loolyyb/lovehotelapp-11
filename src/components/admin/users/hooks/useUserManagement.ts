import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EditUserFormData } from "../types";

export function useUserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: async (data: { userId: string; updates: Partial<EditUserFormData> }) => {
      const { error } = await supabase
        .from("profiles")
        .update(data.updates)
        .eq("id", data.userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Utilisateur mis à jour",
        description: "Les modifications ont été enregistrées avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour l'utilisateur: " + error.message,
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('disable_user', {
        user_id: userId
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Utilisateur désactivé",
        description: "L'utilisateur a été désactivé avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de désactiver l'utilisateur: " + error.message,
      });
    },
  });

  const setUserAsAdminMutation = useMutation({
    mutationFn: async () => {
      const adminUserId = "b777ae12-9da5-46c7-9506-741e90e7d9a8";
      
      let { error: idError } = await supabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", adminUserId);
      
      if (idError) {
        console.error("Error updating with id:", idError);
        
        const { error: userIdError } = await supabase
          .from("profiles")
          .update({ role: "admin" })
          .eq("user_id", adminUserId);
        
        if (userIdError) {
          console.error("Error updating with user_id:", userIdError);
          throw userIdError;
        }
      }
    },
    onSuccess: () => {
      toast({
        title: "Utilisateur promu administrateur",
        description: "L'utilisateur a été défini comme administrateur avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de définir l'utilisateur comme administrateur: " + error.message,
      });
    },
  });

  return {
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    setUserAsAdmin: setUserAsAdminMutation.mutate,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    isSettingAdmin: setUserAsAdminMutation.isPending,
  };
}
