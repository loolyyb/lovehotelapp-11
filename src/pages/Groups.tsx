import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

interface Group {
  id: string;
  name: string;
  description: string;
  group_type: string;
  member_count?: number;
}

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      // First, fetch all groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .order('name');

      if (groupsError) throw groupsError;

      // Then, fetch member counts for each group
      const groupsWithCounts = await Promise.all(
        groupsData.map(async (group) => {
          const { count, error: countError } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          if (countError) {
            console.error('Error fetching member count:', countError);
            return { ...group, member_count: 0 };
          }

          return { ...group, member_count: count || 0 };
        })
      );

      setGroups(groupsWithCounts);
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les groupes. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-burgundy" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-burgundy mb-8">Groupes & Clubs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-burgundy">{group.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{group.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{group.group_type}</span>
                <span>{group.member_count} membres</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}