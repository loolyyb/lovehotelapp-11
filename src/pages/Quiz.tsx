import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication status when component mounts
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Non autorisé",
          description: "Veuillez vous connecter pour accéder au quiz.",
        });
        navigate('/login');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Une erreur est survenue lors de la vérification de votre session.",
      });
      navigate('/login');
    }
  };

  const handleAnswer = async (selectedAnswer: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          variant: "destructive",
          title: "Session expirée",
          description: "Votre session a expiré. Veuillez vous reconnecter.",
        });
        navigate('/login');
        return;
      }

      const correct = selectedAnswer === quizQuestions[currentQuestion].correctAnswer;
      
      if (correct) {
        const newScore = score + quizQuestions[currentQuestion].points;
        setScore(newScore);
        
        try {
          // Get current user's profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('loolyb_tokens')
            .eq('user_id', session.user.id)
            .single();

          if (profileError) throw profileError;

          const currentTokens = profile?.loolyb_tokens || 0;
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              loolyb_tokens: currentTokens + quizQuestions[currentQuestion].points 
            })
            .eq('user_id', session.user.id);

          if (updateError) throw updateError;

          toast({
            title: "Bonne réponse !",
            description: `Vous gagnez ${quizQuestions[currentQuestion].points} LooLyyb tokens !`,
          });
        } catch (error: any) {
          console.error('Error updating tokens:', error);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de mettre à jour vos tokens.",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Mauvaise réponse",
          description: "Essayez encore !",
        });
      }

      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

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
                        disabled={loading}
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
                <Button onClick={restartQuiz} disabled={loading}>
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
