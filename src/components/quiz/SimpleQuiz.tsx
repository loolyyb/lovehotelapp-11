import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const SimpleQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const { toast } = useToast();

  const questions = [
    {
      question: "Qu'est-ce qu'un Love Hotel ?",
      options: [
        "Un hôtel pour des réunions d'affaires",
        "Un espace pour des moments romantiques",
        "Un centre commercial",
      ],
      answer: 1,
    },
    {
      question: "Quels services sont proposés ?",
      options: [
        "Réservations anonymes",
        "Conférences professionnelles",
        "Service de taxi",
      ],
      answer: 0,
    },
  ];

  const handleAnswer = (index: number) => {
    if (index === questions[currentQuestion].answer) {
      setScore(score + 10);
      toast({
        title: "Bonne réponse !",
        description: "Vous gagnez 10 points !",
      });
    } else {
      toast({
        title: "Mauvaise réponse",
        description: "Essayez encore !",
        variant: "destructive",
      });
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowResult(true);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card className="p-6 shadow-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {!showResult ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">
                {questions[currentQuestion].question}
              </h2>
              <div className="space-y-4">
                {questions[currentQuestion].options.map((option, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full text-left py-4 px-6"
                      onClick={() => handleAnswer(index)}
                    >
                      {option}
                    </Button>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Question {currentQuestion + 1} sur {questions.length}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Quiz Terminé !</h2>
              <p className="text-lg mb-6">
                Score : {score} points
              </p>
              <Button
                onClick={() => {
                  setCurrentQuestion(0);
                  setScore(0);
                  setShowResult(false);
                }}
              >
                Recommencer le quiz
              </Button>
            </div>
          )}
        </motion.div>
      </Card>
    </div>
  );
};

export default SimpleQuiz;