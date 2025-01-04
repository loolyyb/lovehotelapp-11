import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

interface Group {
  id: string;
  name: string;
  description: string;
  group_type: 'bdsm' | 'libertins' | 'rideaux_ouverts' | 'other';
}

interface GroupSubscriptionProps {
  userId: string;
}

export function GroupSubscription({ userId }: GroupSubscriptionProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGroups();
    fetchUserGroups();
  }, [userId]);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les groupes.",
      });
    }
  };

  const fetchUserGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);
      
      if (error) throw error;
      setUserGroups(data?.map(item => item.group_id) || []);
    } catch (error) {
      console.error('Error fetching user groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupToggle = async (groupId: string) => {
    const isCurrentlyMember = userGroups.includes(groupId);
    
    try {
      if (isCurrentlyMember) {
        // Leave group
        const { error } = await supabase
          .from('group_members')
          .delete()
          .eq('user_id', userId)
          .eq('group_id', groupId);
        
        if (error) throw error;
        
        setUserGroups(prev => prev.filter(id => id !== groupId));
        toast({
          title: "Succès",
          description: "Vous avez quitté le groupe.",
        });
      } else {
        // Join group
        const { error } = await supabase
          .from('group_members')
          .insert([{ user_id: userId, group_id: groupId }]);
        
        if (error) throw error;
        
        setUserGroups(prev => [...prev, groupId]);
        toast({
          title: "Succès",
          description: "Vous avez rejoint le groupe.",
        });
      }
    } catch (error) {
      console.error('Error toggling group membership:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader className="h-6 w-6 animate-spin text-burgundy" />
      </div>
    );
  }

  const groupTypeLabels = {
    bdsm: 'BDSM',
    libertins: 'Libertins',
    rideaux_ouverts: 'Rideaux Ouverts',
    other: 'Autre'
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-burgundy">
          Groupes & Clubs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {groups.map((group) => (
          <div key={group.id} className="flex items-start space-x-3 p-2 hover:bg-rose/5 rounded-lg transition-colors">
            <Checkbox
              checked={userGroups.includes(group.id)}
              onCheckedChange={() => handleGroupToggle(group.id)}
              className="mt-1"
            />
            <div>
              <div className="font-medium">{group.name}</div>
              <div className="text-sm text-gray-500">{group.description}</div>
              <div className="text-xs text-burgundy mt-1">
                {groupTypeLabels[group.group_type]}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}