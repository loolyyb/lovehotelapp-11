import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileDescription } from "@/components/profile/ProfileDescription";
import { ProfileStatus } from "@/components/profile/ProfileStatus";
import { ProfileOrientation } from "@/components/profile/ProfileOrientation";
import { ProfileSeeking } from "@/components/profile/ProfileSeeking";
import { ProfileRelationshipType } from "@/components/profile/ProfileRelationshipType";
import { ProfilePhotoGallery } from "@/components/profile/ProfilePhotoGallery";
import { Save } from "lucide-react";
import { GroupSubscription } from "@/components/profile/GroupSubscription";

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

      // Ensure relationship_type is always an array
      if (updates.relationship_type && !Array.isArray(updates.relationship_type)) {
        updates.relationship_type = [updates.relationship_type];
      }

      // Ensure seeking is always an array
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
        description: "Impossible de mettre à jour votre profil. Veuillez réessayer.",
      });
    }
  };

  const handleAvatarChange = async (avatarUrl: string) => {
    await updateProfile({ avatar_url: avatarUrl });
  };

  const handlePhotosChange = async (photos: string[]) => {
    await updateProfile({ photo_urls: photos });
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
            onAvatarChange={handleAvatarChange}
            sexualOrientation={profile?.sexual_orientation}
            seeking={profile?.seeking}
            relationshipType={profile?.relationship_type}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProfileDescription
              initialDescription={profile?.description}
              onSave={(description) => updateProfile({ description })}
            />

            <ProfileStatus
              status={profile?.status}
              onStatusChange={(status) => updateProfile({ status })}
            />

            <ProfileRelationshipType
              relationshipType={profile?.relationship_type?.[0] || null}
              onRelationshipTypeChange={(type) => updateProfile({ relationship_type: [type] })}
            />
          </div>

          <GroupSubscription userId={profile?.user_id} />

          <ProfilePhotoGallery
            photos={profile?.photo_urls}
            onPhotosChange={handlePhotosChange}
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
        </Card>
      </div>
    </div>
  );
}
