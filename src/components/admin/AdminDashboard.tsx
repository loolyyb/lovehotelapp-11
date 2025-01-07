import React from "react";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ThemeName } from "@/types/theme";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useNavigate } from "react-router-dom";
import { AdvertisementManager } from "./AdvertisementManager";
import { LogsManager } from "./LogsManager";
import { Loader, Users, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminDashboard() {
  const { currentThemeName, switchTheme } = useTheme();
  const { toast } = useToast();
  const { session, loading } = useAuthSession();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        if (!session?.user?.id) {
          navigate('/login');
          toast({
            title: "Accès refusé",
            description: "Vous devez être connecté pour accéder au tableau de bord administrateur.",
            variant: "destructive",
          });
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          console.error('Error checking admin status:', error);
          navigate('/');
          toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de la vérification de vos droits.",
            variant: "destructive",
          });
          return;
        }

        if (profile?.role !== 'admin') {
          navigate('/');
          toast({
            title: "Accès refusé",
            description: "Vous devez être administrateur pour accéder à cette page.",
            variant: "destructive",
          });
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Error in admin check:', error);
        navigate('/');
      } finally {
        setIsChecking(false);
      }
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [session, navigate, toast, loading]);

  const handleThemeChange = async (themeName: ThemeName) => {
    if (!session) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour changer le thème.",
        variant: "destructive",
      });
      return;
    }

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

  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!session || !isAdmin) {
    return null;
  }

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
            <p className="text-muted-foreground">
              Cette section sera bientôt disponible pour gérer les utilisateurs.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="conversations">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Modération des conversations</h2>
            </div>
            <p className="text-muted-foreground">
              Cette section sera bientôt disponible pour modérer les conversations.
            </p>
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
