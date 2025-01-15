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
        onClick={onNext}
        disabled={isLoading}
        className="ml-auto"
      >
        {isLastStep ? "Terminer" : "Suivant"}
      </Button>
    </div>
  );
}