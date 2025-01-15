import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QualificationStep } from "./QualificationStep";
import { QualificationNavigation } from "./QualificationNavigation";
import { QUALIFICATION_STEPS } from "./types";

interface QualificationJourneyProps {
  onComplete?: () => void;
  isEditing?: boolean;
}

export function QualificationJourney({ onComplete, isEditing = false }: QualificationJourneyProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadQualificationState();
  }, []);

  const loadQualificationState = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: preferences, error } = await supabase
        .from('preferences')
        .select('qualification_step, qualification_data')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading qualification state:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger vos réponses de qualification.",
        });
        return;
      }

      if (preferences) {
        setCurrentStep(preferences.qualification_step || 0);
        if (preferences.qualification_data) {
          setAnswers(preferences.qualification_data as Record<string, any>);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement de vos réponses.",
      });
    }
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const updateProfile = async (answers: Record<string, any>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const profileUpdates = {
        description: answers.description,
        sexual_orientation: answers.sexual_orientation,
        status: answers.status,
        relationship_type: answers.relationship_type,
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('user_id', session.user.id);

      if (profileError) throw profileError;

      const preferencesUpdates = {
        open_curtains_interest: answers.open_curtains_interest === 'true',
        speed_dating_interest: answers.speed_dating_interest === 'true',
        libertine_party_interest: answers.libertine_party_interest === 'true',
      };

      const { error: preferencesError } = await supabase
        .from('preferences')
        .update(preferencesUpdates)
        .eq('user_id', session.user.id);

      if (preferencesError) throw preferencesError;

    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const handleNext = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const nextStep = currentStep + 1;
      const isComplete = nextStep >= QUALIFICATION_STEPS.length;

      // Mettre à jour les préférences
      const { error } = await supabase
        .from('preferences')
        .upsert({
          user_id: session.user.id,
          qualification_step: nextStep,
          qualification_data: answers,
          qualification_completed: isComplete,
          last_qualification_update: new Date().toISOString()
        });

      if (error) throw error;

      // Si c'est la dernière étape, mettre à jour le profil
      if (isComplete) {
        await updateProfile(answers);
        toast({
          title: "Qualification terminée",
          description: "Votre profil a été mis à jour avec succès !",
        });
        onComplete?.();
      } else {
        setCurrentStep(nextStep);
      }
    } catch (error) {
      console.error('Error updating qualification:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder vos réponses.",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentStepData = QUALIFICATION_STEPS[currentStep];
  if (!currentStepData) return null;

  return (
    <div className="space-y-6">
      <QualificationStep
        step={currentStepData}
        answers={answers}
        onAnswer={handleAnswer}
      />
      <QualificationNavigation
        currentStep={currentStep}
        totalSteps={QUALIFICATION_STEPS.length}
        isLoading={loading}
        onNext={handleNext}
        onComplete={onComplete}
        isEditing={isEditing}
      />
    </div>
  );
}