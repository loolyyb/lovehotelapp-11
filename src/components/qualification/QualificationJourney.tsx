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

      const { data: preferences } = await supabase
        .from('preferences')
        .select('qualification_step, qualification_data')
        .eq('user_id', session.user.id)
        .single();

      if (preferences) {
        setCurrentStep(preferences.qualification_step || 0);
        if (preferences.qualification_data) {
          setAnswers(preferences.qualification_data as Record<string, any>);
        }
      }
    } catch (error) {
      console.error('Error loading qualification state:', error);
    }
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const nextStep = currentStep + 1;
      const isComplete = nextStep >= QUALIFICATION_STEPS.length;

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

      if (isComplete) {
        toast({
          title: "Qualification terminée",
          description: "Merci d'avoir complété votre profil !",
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