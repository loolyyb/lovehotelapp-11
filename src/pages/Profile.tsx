import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
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

      // First try to get the existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // If no profile exists, create one
      if (!existingProfile) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            { 
              user_id: user.id,
              full_name: user.email?.split('@')[0] || 'New User', // Default name from email
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
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <h1 className="text-3xl font-playfair mb-6">Mon Profil</h1>
          {profile ? (
            <div className="space-y-4">
              <p><strong>Nom:</strong> {profile.full_name || 'Non renseigné'}</p>
              <p><strong>Bio:</strong> {profile.bio || 'Non renseignée'}</p>
              <p><strong>Membre Love Hotel:</strong> {profile.is_love_hotel_member ? 'Oui' : 'Non'}</p>
              <p><strong>Détenteur LooLyyb:</strong> {profile.is_loolyb_holder ? 'Oui' : 'Non'}</p>
            </div>
          ) : (
            <p>Aucun profil trouvé</p>
          )}
          <div className="mt-6">
            <Button onClick={handleSignOut} variant="destructive">
              Se déconnecter
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}