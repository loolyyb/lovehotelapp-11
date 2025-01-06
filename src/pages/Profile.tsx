import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileForm } from "@/components/profile/form/ProfileForm";
import { Save, CreditCard, Calendar, Heart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const { data: userPreferences, error: preferencesError } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (preferencesError) throw preferencesError;

      if (!existingProfile) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ 
            user_id: user.id,
            full_name: user.email?.split('@')[0] || 'New User',
            is_love_hotel_member: false,
            is_loolyb_holder: false,
            relationship_type: [],
            seeking: [],
            photo_urls: [],
            visibility: 'public',
            allowed_viewers: []
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        setProfile(newProfile);
      } else {
        setProfile(existingProfile);
        setPreferences(userPreferences);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger votre profil. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      if (updates.relationship_type && !Array.isArray(updates.relationship_type)) {
        updates.relationship_type = [updates.relationship_type];
      }

      if (updates.seeking && !Array.isArray(updates.seeking)) {
        updates.seeking = [updates.seeking];
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile((prev: any) => ({ ...prev, ...updates }));
      toast({
        title: "Profil mis à jour",
        description: "Vos modifications ont été enregistrées avec succès.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100 flex items-center justify-center">
        <div className="animate-pulse text-burgundy">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100">
      <div className="container mx-auto px-4 py-4">
        <Card className="p-8 space-y-8 bg-white/80 backdrop-blur-sm shadow-xl rounded-xl animate-fadeIn">
          <ProfileHeader
            avatarUrl={profile?.avatar_url}
            fullName={profile?.full_name}
            bio={profile?.bio}
            canEdit={true}
            onAvatarChange={(url) => updateProfile({ avatar_url: url })}
            sexualOrientation={profile?.sexual_orientation}
            seeking={profile?.seeking}
            relationshipType={profile?.relationship_type}
          />

          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="account" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Mon Compte
              </TabsTrigger>
              <TabsTrigger value="fidelity" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Fidélité
              </TabsTrigger>
              <TabsTrigger value="reservations" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Mes Réservations
              </TabsTrigger>
              <TabsTrigger value="dating" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Rencontres
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account">
              <ProfileForm
                profile={profile}
                onUpdate={updateProfile}
              />
              <div className="pt-8 flex justify-center">
                <Button 
                  onClick={() => updateProfile(profile)}
                  className="px-8 py-6 text-lg bg-burgundy hover:bg-burgundy/90 text-white flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Enregistrer les modifications
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="fidelity">
              <div className="p-6 text-center">
                <h3 className="text-2xl font-semibold text-burgundy mb-4">Programme de Fidélité</h3>
                <p className="text-gray-600">
                  Votre solde de points : {profile?.loolyb_tokens || 0} LooLyyb Tokens
                </p>
              </div>
            </TabsContent>

            <TabsContent value="reservations">
              <div className="p-6 text-center">
                <h3 className="text-2xl font-semibold text-burgundy mb-4">Mes Réservations</h3>
                <p className="text-gray-600">
                  Historique de vos réservations à venir
                </p>
              </div>
            </TabsContent>

            <TabsContent value="dating">
              <div className="p-6 text-center">
                <h3 className="text-2xl font-semibold text-burgundy mb-4">Mes Rencontres</h3>
                <p className="text-gray-600">
                  Gérez vos préférences de rencontres et vos matchs
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}