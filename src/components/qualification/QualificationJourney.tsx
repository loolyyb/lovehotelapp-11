import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Introduction } from "./steps/Introduction";
import { PersonalStatus } from "./steps/PersonalStatus";
import { Motivations } from "./steps/Motivations";
import { Preferences } from "./steps/Preferences";
import { Interests } from "./steps/Interests";
import { Summary } from "./steps/Summary";

export function QualificationJourney() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const steps = [
    { component: Introduction, title: "Introduction" },
    { component: PersonalStatus, title: "Statut Personnel" },
    { component: Motivations, title: "Motivations" },
    { component: Preferences, title: "Préférences" },
    { component: Interests, title: "Centres d'Intérêt" },
    { component: Summary, title: "Récapitulatif" }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async (data: any) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);

    if (currentStep === steps.length - 1) {
      await saveQualification(updatedData);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const saveQualification = async (data: any) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('preferences')
        .upsert({
          user_id: user.id,
          qualification_completed: true,
          qualification_step: steps.length,
          qualification_data: data,
          last_qualification_update: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Qualification terminée",
        description: "Vos préférences ont été enregistrées avec succès.",
      });

      navigate('/profile');
    } catch (error: any) {
      console.error('Error saving qualification:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'enregistrer vos préférences.",
      });
    } finally {
      setLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-b from-champagne to-cream p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-cormorant font-semibold text-burgundy text-center">
            {steps[currentStep].title}
          </h1>
          <Progress value={progress} className="w-full" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-6 rounded-xl"
          >
            <CurrentStepComponent
              onNext={handleNext}
              formData={formData}
              loading={loading}
            />
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={loading}
            >
              Retour
            </Button>
          )}
          {currentStep === 0 && <div />}
        </div>
      </div>
    </div>
  );
}