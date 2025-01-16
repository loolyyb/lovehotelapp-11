import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const quizQuestions = [
  {
    question: "Quelle est la meilleure façon de montrer son amour ?",
    options: [
      "Par des gestes attentionnés au quotidien",
      "Par des cadeaux coûteux",
      "En passant du temps ensemble",
      "En disant 'je t'aime' souvent"
    ],
    correctAnswer: "Par des gestes attentionnés au quotidien",
    points: 10
  },
  {
    question: "Quel est l'ingrédient secret d'une relation durable ?",
    options: [
      "La communication",
      "La passion",
      "L'argent",
      "Les centres d'intérêt communs"
    ],
    correctAnswer: "La communication",
    points: 10
  },
  {
    question: "Quelle est la clé d'une soirée romantique réussie ?",
    options: [
      "Un dîner dans un restaurant étoilé",
      "Une ambiance intime et personnalisée",
      "Des cadeaux surprises",
      "Une activité extraordinaire"
    ],
    correctAnswer: "Une ambiance intime et personnalisée",
    points: 10
  }
];

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const handleAnswer = async (selectedAnswer: string) => {
    const correct = selectedAnswer === quizQuestions[currentQuestion].correctAnswer;
    
    if (correct) {
      const newScore = score + quizQuestions[currentQuestion].points;
      setScore(newScore);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('loolyb_tokens')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        const currentTokens = profile?.loolyb_tokens || 0;
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            loolyb_tokens: currentTokens + quizQuestions[currentQuestion].points 
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        toast({
          title: "Bonne réponse !",
          description: `Vous gagnez ${quizQuestions[currentQuestion].points} LooLyyb tokens !`,
        });
      } catch (error: any) {
        console.error('Error updating tokens:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour vos tokens.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Mauvaise réponse",
        description: "Essayez encore !",
        variant: "destructive",
      });
    }

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 shadow-lg">
            {!showResults ? (
              <>
                <h2 className="text-2xl font-semibold mb-4 text-center">
                  Question {currentQuestion + 1} sur {quizQuestions.length}
                </h2>
                <p className="text-lg mb-6 text-center">
                  {quizQuestions[currentQuestion].question}
                </p>
                <div className="space-y-4">
                  {quizQuestions[currentQuestion].options.map((option, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full text-left py-4 px-6"
                        onClick={() => handleAnswer(option)}
                      >
                        {option}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">Quiz terminé !</h2>
                <p className="text-lg mb-6">
                  Votre score : {score} points
                </p>
                <Button onClick={restartQuiz}>
                  Recommencer le quiz
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}