import { Tables } from "@/integrations/supabase/types";

interface ProfilePreferencesProps {
  preferences: Tables<"preferences"> | null;
  profile: Tables<"profiles">;
}

export function ProfilePreferences({ preferences, profile }: ProfilePreferencesProps) {
  if (!preferences && !profile.sexual_orientation) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {preferences?.location && (
        <div className="p-4 bg-champagne/30 rounded-lg">
          <h3 className="font-semibold text-burgundy mb-2">Localisation</h3>
          <p className="text-gray-700">{preferences.location}</p>
        </div>
      )}
      {profile.sexual_orientation && (
        <div className="p-4 bg-champagne/30 rounded-lg">
          <h3 className="font-semibold text-burgundy mb-2">Orientation</h3>
          <p className="text-gray-700">{profile.sexual_orientation}</p>
        </div>
      )}
    </div>
  );
}