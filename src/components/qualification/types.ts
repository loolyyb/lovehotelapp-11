export interface QuestionType {
  id: string;
  question: string;
  type: "text" | "choice";
  options?: string[];
}

export interface QualificationStepType {
  title: string;
  description: string;
  questions: QuestionType[];
}

export const QUALIFICATION_STEPS: QualificationStepType[] = [
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