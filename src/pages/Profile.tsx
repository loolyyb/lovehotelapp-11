import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Calendar, Heart, Camera, Edit, Mail, Gift } from "lucide-react";

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
        <Card className="p-8 space-y-8 bg-white/80 backdrop-blur-sm shadow-xl rounded-xl animate-fadeIn">
          {/* Profile Header Section */}
          <div className="flex flex-col items-center space-y-6 relative">
            <div className="relative group">
              <Avatar className="w-40 h-40 border-4 border-rose shadow-lg transition-transform duration-300 group-hover:scale-105">
                <AvatarImage 
                  src={profile?.avatar_url} 
                  alt={profile?.full_name}
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl bg-burgundy text-white">
                  {profile?.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-2 right-2 bg-burgundy p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 shadow-lg">
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-3">
                <h1 className="text-4xl font-bold text-burgundy">{profile?.full_name || 'Anonyme'}</h1>
                <button className="text-gray-400 hover:text-burgundy transition-colors p-2 rounded-full hover:bg-rose/10">
                  <Edit className="w-5 h-5" />
                </button>
              </div>
              {profile?.bio && (
                <p className="text-gray-600 max-w-md text-lg">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Profile Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 text-gray-700 text-lg">
                <MapPin className="w-6 h-6 text-burgundy" />
                <span>{preferences?.location || 'Paris, France'}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700 text-lg">
                <Mail className="w-6 h-6 text-burgundy" />
                <span>Messages disponibles</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700 text-lg">
                <Gift className="w-6 h-6 text-burgundy" />
                <span>25 ans</span>
              </div>
              {preferences?.interests && preferences.interests.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-burgundy text-lg">Centres d'intérêt</h3>
                  <div className="flex flex-wrap gap-2">
                    {preferences.interests.map((interest: string, index: number) => (
                      <span 
                        key={index}
                        className="px-4 py-2 bg-rose/20 text-burgundy rounded-full text-sm font-medium hover:bg-rose/30 transition-colors cursor-default"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Membership & Preferences */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Heart className={`w-6 h-6 ${profile?.is_love_hotel_member ? 'text-rose' : 'text-gray-400'}`} />
                <span className="text-lg">{profile?.is_love_hotel_member ? 'Membre Love Hotel' : 'Non membre'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full ${profile?.is_loolyb_holder ? 'bg-burgundy' : 'bg-gray-400'}`} />
                <span className="text-lg">{profile?.is_loolyb_holder ? 'Détenteur LooLyyb' : 'Non détenteur'}</span>
              </div>
              {preferences && (
                <div className="p-6 bg-champagne/30 rounded-xl space-y-4 backdrop-blur-sm">
                  <h3 className="font-semibold text-burgundy text-lg">Préférences</h3>
                  <div className="space-y-2 text-gray-700">
                    <p className="text-lg">
                      Âge: {preferences.min_age} - {preferences.max_age} ans
                    </p>
                    <p className="text-lg">
                      Localisation préférée: {preferences.location}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="pt-8 flex justify-center">
            <Button 
              onClick={handleSignOut}
              variant="destructive"
              className="px-8 py-6 text-lg hover:bg-rose transition-colors"
            >
              Se déconnecter
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}