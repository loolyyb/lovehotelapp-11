import { ProfileDescription } from "../ProfileDescription";
import { ProfileStatus } from "../ProfileStatus";
import { ProfileOrientation } from "../ProfileOrientation";
import { ProfileSeeking } from "../ProfileSeeking";
import { ProfileRelationshipType } from "../ProfileRelationshipType";
import { ProfilePhotoGallery } from "../ProfilePhotoGallery";
import { ProfilePreferencesQuestions } from "../ProfilePreferencesQuestions";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface ProfileFormProps {
  profile: any;
  onUpdate: (updates: any) => Promise<void>;
}

export function ProfileForm({ profile, onUpdate }: ProfileFormProps) {
  const [preferences, setPreferences] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    getPreferences();
  }, []);

  const getPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setPreferences(data);
    } catch (error: any) {
      console.error('Error loading preferences:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger vos préférences.",
      });
    }
  };

  const handlePreferenceChange = async (updates: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          ...updates,
        });

      if (error) throw error;
      setPreferences((prev: any) => ({ ...prev, ...updates }));
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour vos préférences.",
      });
    }
  };

  const WidgetContainer = ({ children, title }: { children: React.ReactNode; title: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6 space-y-4"
    >
      <h2 className="text-2xl font-cormorant font-semibold text-burgundy">{title}</h2>
      {children}
    </motion.div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <WidgetContainer title="À propos de vous">
            <ProfileDescription
              initialDescription={profile?.description}
              onSave={(description) => onUpdate({ description })}
            />
          </WidgetContainer>

          <WidgetContainer title="Statut">
            <ProfileStatus
              status={profile?.status}
              onStatusChange={(status) => onUpdate({ status })}
            />
          </WidgetContainer>

          <WidgetContainer title="Type de relation">
            <ProfileRelationshipType
              relationshipType={profile?.relationship_type}
              onRelationshipTypeChange={(types) => onUpdate({ relationship_type: types })}
            />
          </WidgetContainer>
        </div>

        <div className="space-y-8">
          <WidgetContainer title="Orientation">
            <ProfileOrientation
              orientation={profile?.sexual_orientation}
              onOrientationChange={(orientation) => onUpdate({ sexual_orientation: orientation })}
            />
          </WidgetContainer>

          <WidgetContainer title="Je recherche">
            <ProfileSeeking
              seeking={profile?.seeking}
              status={profile?.status}
              orientation={profile?.sexual_orientation}
              onSeekingChange={(seeking) => onUpdate({ seeking })}
            />
          </WidgetContainer>

          <WidgetContainer title="Préférences">
            <ProfilePreferencesQuestions
              openCurtainsInterest={preferences?.open_curtains_interest}
              speedDatingInterest={preferences?.speed_dating_interest}
              libertinePartyInterest={preferences?.libertine_party_interest}
              onPreferenceChange={handlePreferenceChange}
            />
          </WidgetContainer>
        </div>
      </div>

      <WidgetContainer title="Galerie photos">
        <ProfilePhotoGallery
          photos={profile?.photo_urls}
          onPhotosChange={(photos) => onUpdate({ photo_urls: photos })}
        />
      </WidgetContainer>
    </div>
  );
}