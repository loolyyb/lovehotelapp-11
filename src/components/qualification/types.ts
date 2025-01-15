export interface QuestionType {
  id: string;
  question: string;
  type: "text" | "choice" | "orientation" | "status" | "relationship" | "seeking" | "username";
  options?: string[];
}

export interface QualificationStepType {
  title: string;
  description: string;
  questions: QuestionType[];
}

export const QUALIFICATION_STEPS: QualificationStepType[] = [
  {
    title: "Votre pseudo",
    description: "Choisissez un pseudo qui vous représente",
    questions: [
      {
        id: "username",
        question: "Votre pseudo",
        type: "username"
      }
    ]
  },
  {
    title: "Votre orientation",
    description: "Aidez-nous à mieux vous connaître",
    questions: [
      {
        id: "sexual_orientation",
        question: "Quelle est votre orientation sexuelle ?",
        type: "orientation",
        options: ["hetero", "gay", "bisexual", "pansexual"]
      }
    ]
  },
  {
    title: "Votre statut",
    description: "Votre situation actuelle",
    questions: [
      {
        id: "status",
        question: "Quel est votre statut ?",
        type: "status",
        options: [
          "single_man",
          "married_man",
          "single_woman",
          "married_woman",
          "couple_mf",
          "couple_mm",
          "couple_ff"
        ]
      }
    ]
  },
  {
    title: "Type de relation",
    description: "Ce que vous recherchez",
    questions: [
      {
        id: "relationship_type",
        question: "Quel type de relation ou expérience recherchez-vous ? (Plusieurs choix possibles)",
        type: "relationship",
        options: [
          "casual",
          "serious", 
          "libertine",
          "bdsm",
          "exhibitionist"
        ]
      }
    ]
  },
  {
    title: "Vos centres d'intérêt",
    description: "Vos préférences pour nos événements",
    questions: [
      {
        id: "open_curtains_interest",
        question: "Intéressé(e) par notre option rideau ouvert ?",
        type: "choice",
        options: ["true", "false"]
      },
      {
        id: "speed_dating_interest",
        question: "Intéressé(e) de participer à nos sessions de speed dating ?",
        type: "choice",
        options: ["true", "false"]
      },
      {
        id: "libertine_party_interest",
        question: "Intéressé(e) de participer à nos soirées libertines ?",
        type: "choice",
        options: ["true", "false"]
      }
    ]
  }
];
