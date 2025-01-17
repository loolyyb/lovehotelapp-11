import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';
import './SwipePage.css';

type Profile = Tables<"profiles">;

export default function SwipePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('visibility', 'public');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les profils. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = (direction: string, profileId: string) => {
    console.log(`Profile ${profileId} swiped ${direction}`);
    // Ici nous pourrons ajouter la logique de matching plus tard
  };

  const handleCardLeftScreen = (direction: string, profileId: string) => {
    console.log(`Profile ${profileId} left the screen to ${direction}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100" id="swipe-page">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-cormorant text-burgundy text-center mb-8">
          Slider les profils
        </h1>
        
        <div className="relative h-[70vh] w-full max-w-md mx-auto swipe-container">
          {profiles.map((profile) => (
            <div key={profile.id} className="absolute w-full h-full swipe-card">
              <SwipeCard
                onSwipe={(direction) => handleSwipe(direction, profile.id)}
                onCardLeftScreen={(direction) => handleCardLeftScreen(direction, profile.id)}
              >
                <div className="w-full h-full bg-white rounded-xl shadow-xl overflow-hidden">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || 'Profile'}
                      className="w-full h-2/3 object-cover"
                    />
                  ) : (
                    <div className="w-full h-2/3 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Pas de photo</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-burgundy">
                      {profile.full_name || 'Anonyme'}
                    </h3>
                    <p className="text-gray-600 mt-2 line-clamp-3">
                      {profile.bio || 'Aucune description'}
                    </p>
                  </div>
                </div>
              </SwipeCard>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}