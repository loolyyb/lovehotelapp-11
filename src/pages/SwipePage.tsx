import { useState, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

const SwipePage = () => {
  const [profiles, setProfiles] = useState<Tables<"profiles">[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('visibility', 'public');

        if (error) throw error;
        
        if (data) {
          // Filter out profiles without required fields
          const validProfiles = data.filter(profile => 
            profile.full_name && profile.avatar_url
          );
          setProfiles(validProfiles);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les profils.",
        });
      }
    };

    fetchProfiles();
  }, [toast]);

  const swiped = (direction: string, profileId: string) => {
    console.log(`Profile ${profileId} swiped ${direction}`);
    // TODO: Implement match logic based on direction
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100 py-8 px-4"
    >
      <h1 className="text-3xl font-cormorant text-burgundy text-center font-bold mb-8">
        Découvrir des profils
      </h1>
      
      <div className="max-w-md mx-auto relative h-[60vh]">
        {profiles.map((profile) => (
          <TinderCard
            key={profile.id}
            onSwipe={(dir) => swiped(dir, profile.id)}
            className="absolute w-full"
            preventSwipe={['up', 'down']}
          >
            <motion.div 
              className="card-gradient rounded-xl shadow-xl overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative aspect-[3/4]">
                <img
                  src={profile.avatar_url || '/placeholder.svg'}
                  alt={profile.full_name || 'Profile'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-white text-2xl font-semibold font-cormorant">
                    {profile.full_name}
                  </h3>
                  {profile.bio && (
                    <p className="text-white/90 text-sm font-montserrat mt-2 line-clamp-2">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </TinderCard>
        ))}
      </div>
    </motion.div>
  );
};

export default SwipePage;