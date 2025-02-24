
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

  return {
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  };
}
