import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

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

  const updatePoints = async (earnedPoints: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour gagner des points",
          variant: "destructive",
        });
        return;
      }

      // Get current points
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('loyalty_points')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const currentPoints = profile?.loyalty_points || 0;
      
      // Update points
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          loyalty_points: currentPoints + earnedPoints 
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Points mis à jour !",
        description: `Vous avez gagné ${earnedPoints} points de fidélité !`,
      });
    } catch (error: any) {
      console.error('Error updating points:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour vos points",
        variant: "destructive",
      });
    }
  };

  const handleAnswer = async (index: number) => {
    if (index === questions[currentQuestion].answer) {
      const earnedPoints = 10;
      setScore(score + earnedPoints);
      await updatePoints(earnedPoints);
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