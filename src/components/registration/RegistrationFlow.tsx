import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileDescription } from "@/components/profile/ProfileDescription";
import { ProfileOrientation } from "@/components/profile/ProfileOrientation";
import { ProfileStatus } from "@/components/profile/ProfileStatus";
import { ProfileSeeking } from "@/components/profile/ProfileSeeking";
import { ProfileRelationshipType } from "@/components/profile/ProfileRelationshipType";
import { ProfilePreferencesQuestions } from "@/components/profile/ProfilePreferencesQuestions";
import { motion, AnimatePresence } from "framer-motion";

export function RegistrationFlow() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Load profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load preferences data
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (preferencesError && preferencesError.code !== 'PGRST116') throw preferencesError;
      setPreferences(preferencesData || {});

    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger vos données.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updates: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile((prev: any) => ({ ...prev, ...updates }));
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil.",
      });
    }
  };

  const handlePreferencesUpdate = async (updates: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

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

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      navigate('/profile');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin text-burgundy">Chargement...</div>
      </div>
    );
  }

  const renderStep = () => {
    const slideVariants = {
      enter: { x: 300, opacity: 0 },
      center: { x: 0, opacity: 1 },
      exit: { x: -300, opacity: 0 }
    };

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="space-y-6"
        >
          {step === 1 && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-burgundy mb-4">À propos de vous</h2>
              <ProfileDescription
                initialDescription={profile?.description}
                onSave={(description) => handleProfileUpdate({ description })}
              />
            </Card>
          )}

          {step === 2 && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-burgundy mb-4">Orientation</h2>
              <ProfileOrientation
                orientation={profile?.sexual_orientation}
                onOrientationChange={(orientation) => handleProfileUpdate({ sexual_orientation: orientation })}
              />
            </Card>
          )}

          {step === 3 && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-burgundy mb-4">Statut</h2>
              <ProfileStatus
                status={profile?.status}
                onStatusChange={(status) => handleProfileUpdate({ status })}
              />
            </Card>
          )}

          {step === 4 && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-burgundy mb-4">Je recherche</h2>
              <ProfileSeeking
                seeking={profile?.seeking}
                status={profile?.status}
                orientation={profile?.sexual_orientation}
                onSeekingChange={(seeking) => handleProfileUpdate({ seeking })}
              />
            </Card>
          )}

          {step === 5 && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-burgundy mb-4">Type de relation</h2>
              <ProfileRelationshipType
                relationshipType={profile?.relationship_type}
                onRelationshipTypeChange={(types) => handleProfileUpdate({ relationship_type: types })}
              />
            </Card>
          )}

          {step === 6 && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-burgundy mb-4">Préférences</h2>
              <ProfilePreferencesQuestions
                openCurtainsInterest={preferences?.open_curtains_interest}
                speedDatingInterest={preferences?.speed_dating_interest}
                libertinePartyInterest={preferences?.libertine_party_interest}
                onPreferenceChange={handlePreferencesUpdate}
              />
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100 py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-cormorant font-bold text-burgundy">
              Configuration du profil
            </h1>
            <div className="text-sm text-gray-500">
              Étape {step} sur 6
            </div>
          </div>

          {renderStep()}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              Retour
            </Button>
            <Button onClick={handleNext}>
              {step === 6 ? "Terminer" : "Suivant"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}