import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AboutSection } from "./AboutSection";
import { StatusSection } from "./StatusSection";
import { RelationshipSection } from "./RelationshipSection";
import { TokensSection } from "./TokensSection";
import { OrientationSection } from "./OrientationSection";
import { SeekingSection } from "./SeekingSection";
import { PreferencesSection } from "./PreferencesSection";
import { GallerySection } from "./GallerySection";

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
      console.log("Fetching preferences...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found");
        return;
      }

      // Get the most recent preferences
      const { data, error } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error loading preferences:', error);
        // If no preferences exist, we'll create a new one
        if (error.code === 'PGRST116') {
          const { data: newPreferences, error: createError } = await supabase
            .from('preferences')
            .insert([{
              user_id: user.id,
              open_curtains: false,
              open_curtains_interest: false,
              speed_dating_interest: false,
              libertine_party_interest: false,
              interests: []
            }])
            .select()
            .single();

          if (createError) throw createError;
          setPreferences(newPreferences);
          return;
        }

        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger vos préférences.",
        });
        return;
      }

      console.log("Preferences loaded:", data);
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

      console.log("Updating preferences with:", updates);
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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <AboutSection 
            description={profile?.description}
            onUpdate={onUpdate}
          />
          
          <StatusSection
            status={profile?.status}
            onUpdate={onUpdate}
          />

          <RelationshipSection
            relationshipType={profile?.relationship_type}
            onUpdate={onUpdate}
          />

          <TokensSection
            tokens={profile?.loolyb_tokens}
            onUpdate={onUpdate}
          />
        </div>

        <div className="space-y-8">
          <OrientationSection
            orientation={profile?.sexual_orientation}
            onUpdate={onUpdate}
          />

          <SeekingSection
            seeking={profile?.seeking}
            status={profile?.status}
            orientation={profile?.sexual_orientation}
            onUpdate={onUpdate}
          />

          <PreferencesSection
            preferences={preferences}
            onPreferenceChange={handlePreferenceChange}
          />
        </div>
      </div>

      <GallerySection
        photos={profile?.photo_urls}
        onUpdate={onUpdate}
      />
    </div>
  );
}