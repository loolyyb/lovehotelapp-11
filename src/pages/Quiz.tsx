import { LoveQuiz } from "@/components/quiz/Quiz";

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-champagne to-cream py-24">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-cormorant font-bold text-burgundy text-center mb-12">
          Quiz Romantique
        </h1>
        <LoveQuiz />
      </div>
    </div>
  );
}