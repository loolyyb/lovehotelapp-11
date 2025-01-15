import React from 'react';
import { Button } from '@/components/ui/button';

interface QualificationNavigationProps {
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  onNext: () => void;
  onComplete?: () => void;
  isEditing?: boolean;
}

export function QualificationNavigation({
  currentStep,
  totalSteps,
  isLoading,
  onNext,
  onComplete,
  isEditing
}: QualificationNavigationProps) {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex justify-between w-full max-w-2xl mx-auto mt-4">
      {isEditing && (
        <Button 
          variant="outline"
          onClick={onComplete}
          className="mr-2"
        >
          Retour au profil
        </Button>
      )}
      <Button 
        onClick={onNext}
        disabled={isLoading}
        className="ml-auto bg-rose-500 hover:bg-rose-600 text-white"
      >
        {isLastStep ? "Terminer" : "Suivant"}
      </Button>
    </div>
  );
}