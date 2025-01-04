import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

interface Group {
  id: string;
  name: string;
  description: string;
  group_type: 'bdsm' | 'libertins' | 'rideaux_ouverts' | 'other';
  member_count: number;
}

interface GroupResponse {
  id: string;
  name: string;
  description: string;
  group_type: 'bdsm' | 'libertins' | 'rideaux_ouverts' | 'other';
  member_count: { count: number }[];
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
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          member_count:group_members(count)
        `)
        .order('name');
      
      if (error) throw error;

      // Transform the data to match our Group interface
      const transformedGroups: Group[] = (data as GroupResponse[]).map(group => ({
        ...group,
        member_count: group.member_count[0]?.count || 0
      }));

      setGroups(transformedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les groupes.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
              <CardDescription>
                {group.member_count} membre{group.member_count !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{group.description}</p>
              <div className="text-sm font-medium text-burgundy">
                {group.group_type === 'bdsm' && 'BDSM'}
                {group.group_type === 'libertins' && 'Libertins'}
                {group.group_type === 'rideaux_ouverts' && 'Rideaux Ouverts'}
                {group.group_type === 'other' && 'Autre'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}