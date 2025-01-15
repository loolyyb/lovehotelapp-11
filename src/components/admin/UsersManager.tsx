import React from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  role: "user" | "moderator" | "admin";
  is_love_hotel_member: boolean;
  is_loolyb_holder: boolean;
}

export function UsersManager() {
  const { toast } = useToast();
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin_profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });

  const updateUserRole = async (userId: string, newRole: Profile["role"]) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Rôle mis à jour",
        description: "Le rôle de l'utilisateur a été mis à jour avec succès.",
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le rôle de l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Gestion des utilisateurs</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Chargement...
              </TableCell>
            </TableRow>
          ) : profiles && profiles.length > 0 ? (
            profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>{profile.full_name || "Non renseigné"}</TableCell>
                <TableCell>{profile.username || "Non renseigné"}</TableCell>
                <TableCell>
                  <Badge>{profile.role}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {profile.is_love_hotel_member && (
                      <Badge variant="secondary">Love Hotel</Badge>
                    )}
                    {profile.is_loolyb_holder && (
                      <Badge variant="secondary">LooLyyB</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateUserRole(profile.id, "moderator")}
                      disabled={profile.role === "moderator"}
                    >
                      Modérateur
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateUserRole(profile.id, "user")}
                      disabled={profile.role === "user"}
                    >
                      Utilisateur
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Aucun utilisateur trouvé
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}