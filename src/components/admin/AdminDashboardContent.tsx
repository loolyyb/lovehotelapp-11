import React from "react";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ThemeName } from "@/types/theme";
import { Loader, Users, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdvertisementManager } from "./AdvertisementManager";
import { LogsManager } from "./LogsManager";
import { Session } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

interface AdminDashboardContentProps {
  session: Session;
}

export function AdminDashboardContent({ session }: AdminDashboardContentProps) {
  const { currentThemeName, switchTheme } = useTheme();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  // Fetch users data
  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch conversations data
  const { data: conversations } = useQuery({
    queryKey: ["admin-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          user1:profiles!conversations_user1_profile_fkey(username, full_name),
          user2:profiles!conversations_user2_profile_fkey(username, full_name),
          messages(count)
        `)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleThemeChange = async (themeName: ThemeName) => {
    setIsLoading(true);
    try {
      await switchTheme(themeName);
      
      const { error } = await supabase
        .from('admin_settings')
        .update({ 
          value: { current: themeName, available: ["default", "lover"] },
          updated_at: new Date().toISOString()
        })
        .eq('key', 'theme');

      if (error) throw error;

      toast({
        title: "Thème mis à jour",
        description: `Le thème ${themeName} a été activé avec succès.`,
      });
    } catch (error) {
      console.error('Error updating theme:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le thème. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-8">Tableau de bord administrateur</h1>
      
      <Tabs defaultValue="theme" className="space-y-6">
        <TabsList>
          <TabsTrigger value="theme">Thème</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="ads">Publicités</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="theme">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Gestion des thèmes</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Thème actuel : {currentThemeName}</span>
                <div className="space-x-4">
                  <Button
                    onClick={() => handleThemeChange("default")}
                    variant={currentThemeName === "default" ? "secondary" : "outline"}
                    className="cursor-pointer hover:bg-secondary/80"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                    Thème par défaut
                  </Button>
                  <Button
                    onClick={() => handleThemeChange("lover")}
                    variant={currentThemeName === "lover" ? "secondary" : "outline"}
                    className="cursor-pointer hover:bg-secondary/80"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                    Thème Lover
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Gestion des utilisateurs</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2">Nom</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Rôle</th>
                    <th className="text-left p-2">Date d'inscription</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="p-2">{user.full_name || user.username}</td>
                      <td className="p-2">{user.user_id}</td>
                      <td className="p-2">{user.role}</td>
                      <td className="p-2">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="conversations">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Modération des conversations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2">Utilisateur 1</th>
                    <th className="text-left p-2">Utilisateur 2</th>
                    <th className="text-left p-2">Messages</th>
                    <th className="text-left p-2">Statut</th>
                    <th className="text-left p-2">Dernière activité</th>
                  </tr>
                </thead>
                <tbody>
                  {conversations?.map((conv) => (
                    <tr key={conv.id} className="border-t">
                      <td className="p-2">{conv.user1?.username || conv.user1?.full_name}</td>
                      <td className="p-2">{conv.user2?.username || conv.user2?.full_name}</td>
                      <td className="p-2">{conv.messages?.[0]?.count || 0}</td>
                      <td className="p-2">{conv.status}</td>
                      <td className="p-2">
                        {new Date(conv.updated_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ads">
          <AdvertisementManager session={session} />
        </TabsContent>

        <TabsContent value="logs">
          <LogsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}