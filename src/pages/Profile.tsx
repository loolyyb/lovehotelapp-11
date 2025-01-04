import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Calendar, Heart, Camera, Edit } from "lucide-react";

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
          .insert([
            { 
              user_id: user.id,
              full_name: user.email?.split('@')[0] || 'New User',
              is_love_hotel_member: false,
              is_loolyb_holder: false
            }
          ])
          .select()
          .single();

        if (insertError) throw insertError;
        setProfile(newProfile);
        toast({
          title: "Profil créé",
          description: "Votre profil a été créé avec succès.",
        });
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100 flex items-center justify-center">
        <div className="animate-pulse text-burgundy">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 space-y-8 animate-fadeIn">
          <div className="flex flex-col items-center space-y-4 relative">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-rose shadow-lg">
                <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                <AvatarFallback className="text-2xl bg-burgundy text-white">
                  {profile?.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 bg-burgundy p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold text-burgundy">{profile?.full_name || 'Anonyme'}</h1>
              <button className="text-gray-400 hover:text-burgundy transition-colors">
                <Edit className="w-4 h-4" />
              </button>
            </div>
            {profile?.bio && (
              <p className="text-gray-600 text-center max-w-md">{profile.bio}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{preferences?.location || 'Paris, France'}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>Membre depuis {new Date(profile?.created_at).toLocaleDateString()}</span>
              </div>
              {preferences?.interests && preferences.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {preferences.interests.map((interest: string, index: number) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-rose/20 text-burgundy rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Heart className={`w-5 h-5 ${profile?.is_love_hotel_member ? 'text-rose' : 'text-gray-400'}`} />
                <span>{profile?.is_love_hotel_member ? 'Membre Love Hotel' : 'Non membre'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-5 h-5 rounded-full ${profile?.is_loolyb_holder ? 'bg-burgundy' : 'bg-gray-400'}`} />
                <span>{profile?.is_loolyb_holder ? 'Détenteur LooLyyb' : 'Non détenteur'}</span>
              </div>
              {preferences && (
                <div className="mt-4 p-4 bg-champagne/20 rounded-lg">
                  <h3 className="font-semibold text-burgundy mb-2">Préférences</h3>
                  <p className="text-sm text-gray-600">
                    Âge: {preferences.min_age} - {preferences.max_age} ans
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 flex justify-center">
            <Button 
              onClick={handleSignOut}
              variant="destructive"
              className="hover:bg-rose transition-colors"
            >
              Se déconnecter
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}