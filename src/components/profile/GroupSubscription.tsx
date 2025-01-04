import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Group {
  id: string;
  name: string;
  description: string | null;
}

interface GroupSubscriptionProps {
  userId: string | undefined;
}

export function GroupSubscription({ userId }: GroupSubscriptionProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    try {
      // Charger les groupes disponibles
      const { data: availableGroups, error: groupsError } = await supabase
        .from("groups")
        .select("id, name, description")
        .order("name");

      if (groupsError) throw groupsError;

      // Charger les adhésions actuelles de l'utilisateur
      const { data: memberships, error: membershipsError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", userId);

      if (membershipsError) throw membershipsError;

      setGroups(availableGroups || []);
      setSelectedGroups(memberships?.map(m => m.group_id) || []);
    } catch (error: any) {
      console.error("Error loading groups data:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les groupes. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = async (groupId: string) => {
    try {
      const isSelected = selectedGroups.includes(groupId);
      
      if (isSelected) {
        // Supprimer l'adhésion
        const { error } = await supabase
          .from("group_members")
          .delete()
          .eq("user_id", userId)
          .eq("group_id", groupId);

        if (error) throw error;

        setSelectedGroups(prev => prev.filter(id => id !== groupId));
        toast({
          title: "Groupe quitté",
          description: "Vous avez quitté le groupe avec succès.",
        });
      } else {
        // Ajouter l'adhésion
        const { error } = await supabase
          .from("group_members")
          .insert([
            {
              user_id: userId,
              group_id: groupId,
              role: "member"
            }
          ]);

        if (error) throw error;

        setSelectedGroups(prev => [...prev, groupId]);
        toast({
          title: "Groupe rejoint",
          description: "Vous avez rejoint le groupe avec succès.",
        });
      }
    } catch (error: any) {
      console.error("Error toggling group membership:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier l'adhésion au groupe. Veuillez réessayer.",
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">Groupes</h2>
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Groupes</h2>
      <div className="space-y-2">
        {groups.map((group) => (
          <div
            key={group.id}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
            onClick={() => toggleGroup(group.id)}
          >
            <div>
              <h3 className="font-medium">{group.name}</h3>
              {group.description && (
                <p className="text-sm text-gray-500">{group.description}</p>
              )}
            </div>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                ${
                  selectedGroups.includes(group.id)
                    ? "bg-burgundy border-burgundy"
                    : "border-gray-300"
                }`}
            >
              {selectedGroups.includes(group.id) && (
                <span className="text-white text-sm">✓</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}