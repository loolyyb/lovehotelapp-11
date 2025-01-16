import React from 'react';
import Quiz from 'react-quiz-component';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const quizData = {
  quizTitle: "Quiz Romantique",
  quizSynopsis: "Testez vos connaissances sur l'amour et gagnez des LooLyyb tokens !",
  nrOfQuestions: "5",
  questions: [
    {
      question: "Quel est le symbole traditionnel de l'amour ?",
      questionType: "text",
      answerSelectionType: "single",
      answers: [
        "Un cœur",
        "Une étoile",
        "Un cercle",
        "Un carré"
      ],
      correctAnswer: "1",
      messageForCorrectAnswer: "Excellent ! Le cœur est en effet le symbole universel de l'amour.",
      messageForIncorrectAnswer: "Pas tout à fait ! Le cœur est le symbole traditionnel de l'amour.",
      explanation: "Le cœur est utilisé depuis des siècles comme symbole de l'amour et des émotions.",
      point: "20"
    },
    {
      question: "Quelle est la date de la Saint-Valentin ?",
      questionType: "text",
      answerSelectionType: "single",
      answers: [
        "14 février",
        "25 décembre",
        "1er janvier",
        "31 octobre"
      ],
      correctAnswer: "1",
      messageForCorrectAnswer: "Parfait ! La Saint-Valentin est bien le 14 février.",
      messageForIncorrectAnswer: "La Saint-Valentin est célébrée le 14 février.",
      explanation: "Le 14 février est célébré comme la fête des amoureux dans de nombreux pays.",
      point: "20"
    }
  ]
};

export const LoveQuiz = () => {
  const { toast } = useToast();

  const handleQuizEnd = async (results: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour gagner des tokens",
          variant: "destructive",
        });
        return;
      }

      const earnedPoints = results.correctPoints;
      const { error } = await supabase
        .from('profiles')
        .update({ 
          loolyb_tokens: earnedPoints
        })
        .eq('user_id', session.user.id);

      if (error) throw error;

      toast({
        title: "Félicitations !",
        description: `Vous avez gagné ${earnedPoints} LooLyyb tokens !`,
      });
    } catch (error) {
      console.error('Error updating tokens:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour vos tokens",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="bg-white rounded-xl shadow-lg p-6">
        <Quiz 
          quiz={quizData}
          shuffle={true}
          showInstantFeedback={true}
          onComplete={handleQuizEnd}
        />
      </div>
    </motion.div>
  );
};