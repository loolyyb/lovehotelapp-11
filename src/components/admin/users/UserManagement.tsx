
import React from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { UserForm } from "./UserForm";
import { UserTable } from "./UserTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";

export function UserManagement() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Récupérer d'abord les profils avec tous les champs
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Fetched profiles:', profiles);

      // Récupérer les utilisateurs via l'Edge Function
      const { data: authData, error: authError } = await supabase.functions.invoke('list-users');
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
        throw authError;
      }

      console.log('Fetched auth users:', authData);

      // Combiner les données des profils avec les emails des utilisateurs
      const combinedData = profiles.map(profile => {
        const authUser = authData.users.find(user => user.id === profile.user_id);
        return {
          ...profile,
          user: {
            email: authUser?.email
          }
        };
      });

      console.log('Combined data:', combinedData);
      return combinedData;
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string, updates: any }) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Succès",
        description: "L'utilisateur a été mis à jour",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour l'utilisateur",
      });
      console.error('Error updating user:', error);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Succès",
        description: "L'utilisateur a été supprimé",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur",
      });
      console.error('Error deleting user:', error);
    }
  });

  const handleUpdateUser = async (userId: string, updates: any) => {
    updateUserMutation.mutate({ userId, updates });
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Gestion des utilisateurs</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
            </DialogHeader>
            <UserForm
              onSubmit={async (data) => {
                try {
                  const { error } = await supabase.functions.invoke('create-user', {
                    body: data
                  });
                  
                  if (error) throw error;
                  
                  toast({
                    title: "Succès",
                    description: "L'utilisateur a été créé",
                  });
                  setIsDialogOpen(false);
                  queryClient.invalidateQueries({ queryKey: ['admin-users'] });
                } catch (error) {
                  console.error('Error creating user:', error);
                  toast({
                    variant: "destructive",
                    title: "Erreur",
                    description: "Impossible de créer l'utilisateur",
                  });
                }
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <UserTable
        users={users || []}
        onUpdate={handleUpdateUser}
        onDelete={handleDeleteUser}
      />
    </Card>
  );
}
