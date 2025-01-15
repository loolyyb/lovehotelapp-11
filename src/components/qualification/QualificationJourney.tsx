import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface QualificationStep {
  title: string;
  description: string;
  questions: {
    id: string;
    question: string;
    type: "text" | "choice";
    options?: string[];
  }[];
}

interface QualificationJourneyProps {
  onComplete?: () => void;
  isEditing?: boolean;
}

const QUALIFICATION_STEPS: QualificationStep[] = [
  {
    title: "Vos motivations",
    description: "Parlez-nous de vos attentes",
    questions: [
      {
        id: "motivation",
        question: "Qu'est-ce qui vous amène sur notre plateforme ?",
        type: "text"
      }
    ]
  },
  {
    title: "Vos préférences",
    description: "Aidez-nous à mieux vous connaître",
    questions: [
      {
        id: "interests",
        question: "Quels types d'événements vous intéressent ?",
        type: "choice",
        options: ["Soirées libertines", "Speed dating", "Rideaux ouverts"]
      }
    ]
  }
];

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-4"
    >
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-burgundy">
            {currentStepData.title}
          </h2>
          <p className="text-gray-600">{currentStepData.description}</p>
        </div>

        <div className="space-y-6">
          {currentStepData.questions.map((q) => (
            <div key={q.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {q.question}
              </label>
              {q.type === "text" ? (
                <textarea
                  className="w-full p-2 border rounded-md"
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswer(q.id, e.target.value)}
                />
              ) : (
                <div className="space-y-2">
                  {q.options?.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={Array.isArray(answers[q.id]) && answers[q.id]?.includes(option)}
                        onChange={(e) => {
                          const current = Array.isArray(answers[q.id]) ? answers[q.id] : [];
                          const updated = e.target.checked
                            ? [...current, option]
                            : current.filter((o: string) => o !== option);
                          handleAnswer(q.id, updated);
                        }}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          {isEditing && (
            <Button 
              variant="outline"
              onClick={onComplete}
            >
              Retour au profil
            </Button>
          )}
          <Button 
            onClick={handleNext}
            disabled={loading}
            className="ml-auto"
          >
            {currentStep === QUALIFICATION_STEPS.length - 1 ? "Terminer" : "Suivant"}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}