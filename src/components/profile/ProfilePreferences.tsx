import { Tables } from "@/integrations/supabase/types";
import { MapPin, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface ProfilePreferencesProps {
  preferences: Tables<"preferences"> | null;
  profile: Tables<"profiles">;
}

export function ProfilePreferences({ preferences, profile }: ProfilePreferencesProps) {
  const getLocationLabel = (value: string) => {
    const locations = {
      "paris-chatelet": "Paris Châtelet",
      "paris-pigalle": "Paris Pigalle"
    };
    return locations[value as keyof typeof locations] || value;
  };

  if (!preferences && !profile.sexual_orientation) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {preferences?.location && (
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="glass-card p-6 rounded-xl space-y-3"
        >
          <div className="flex items-center gap-2 text-burgundy">
            <MapPin className="w-5 h-5" />
            <h3 className="font-semibold">Localisation</h3>
          </div>
          <p className="text-gray-700">{getLocationLabel(preferences.location)}</p>
        </motion.div>
      )}
      
      {profile.sexual_orientation && (
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="glass-card p-6 rounded-xl space-y-3"
        >
          <div className="flex items-center gap-2 text-burgundy">
            <Heart className="w-5 h-5" />
            <h3 className="font-semibold">Orientation</h3>
          </div>
          <p className="text-gray-700">{profile.sexual_orientation}</p>
        </motion.div>
      )}
    </div>
  );
}