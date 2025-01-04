import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ThemeName } from "@/types/theme";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useNavigate } from "react-router-dom";

interface Advertisement {
  id: string;
  location: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  format: string;
  active: boolean;
}

export function AdminDashboard() {
  const { currentThemeName, switchTheme } = useTheme();
  const { toast } = useToast();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuthSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }
    fetchAdvertisements();
  }, [session, navigate]);

  const fetchAdvertisements = async () => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdvertisements(data || []);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les publicités.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (themeName: ThemeName) => {
    if (!session) return;

    try {
      // Update theme in UI
      switchTheme(themeName);
      
      // Update theme in database
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
        description: "Impossible de mettre à jour le thème.",
        variant: "destructive",
      });
    }
  };

  const toggleAdvertisementStatus = async (id: string, currentStatus: boolean) => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      await fetchAdvertisements();
      toast({
        title: "Statut mis à jour",
        description: `La publicité a été ${!currentStatus ? 'activée' : 'désactivée'} avec succès.`,
      });
    } catch (error) {
      console.error('Error updating advertisement status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la publicité.",
        variant: "destructive",
      });
    }
  };

  const updateAdvertisement = async (id: string, updates: Partial<Advertisement>) => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from('advertisements')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchAdvertisements();
      toast({
        title: "Publicité mise à jour",
        description: "La publicité a été mise à jour avec succès.",
      });
    } catch (error) {
      console.error('Error updating advertisement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la publicité.",
        variant: "destructive",
      });
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-8">Tableau de bord administrateur</h1>
      
      {/* Theme Management Section */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Gestion des thèmes</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Thème actuel : {currentThemeName}</span>
            <div className="space-x-4">
              <Button
                onClick={() => handleThemeChange("default")}
                variant={currentThemeName === "default" ? "secondary" : "outline"}
                className="cursor-pointer hover:bg-secondary/80"
              >
                Thème par défaut
              </Button>
              <Button
                onClick={() => handleThemeChange("lover")}
                variant={currentThemeName === "lover" ? "secondary" : "outline"}
                className="cursor-pointer hover:bg-secondary/80"
              >
                Thème Lover
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Advertisement Management Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Gestion des publicités</h2>
        {loading ? (
          <p>Chargement des publicités...</p>
        ) : (
          <div className="space-y-6">
            {advertisements.map((ad) => (
              <Card key={ad.id} className="p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Titre</label>
                      <Input
                        value={ad.title}
                        onChange={(e) => updateAdvertisement(ad.id, { title: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Textarea
                        value={ad.description || ''}
                        onChange={(e) => updateAdvertisement(ad.id, { description: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">URL de l'image</label>
                      <Input
                        value={ad.image_url || ''}
                        onChange={(e) => updateAdvertisement(ad.id, { image_url: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">URL du lien</label>
                      <Input
                        value={ad.link_url || ''}
                        onChange={(e) => updateAdvertisement(ad.id, { link_url: e.target.value })}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Emplacement</label>
                      <Input
                        value={ad.location}
                        readOnly
                        className="w-full bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Format</label>
                      <Input
                        value={ad.format}
                        readOnly
                        className="w-full bg-gray-50"
                      />
                    </div>
                    <div className="pt-4">
                      <Button
                        onClick={() => toggleAdvertisementStatus(ad.id, ad.active)}
                        variant={ad.active ? "destructive" : "default"}
                        className="w-full"
                      >
                        {ad.active ? 'Désactiver' : 'Activer'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}