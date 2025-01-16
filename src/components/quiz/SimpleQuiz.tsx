import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const prompts = {
  intro: "Un écran interactif avec un design moderne, montrant un bouton 'Commencer le quiz'. Ajoutez des éléments subtils rappelant les Love Hôtels, comme des roses rouges, des lumières tamisées et un fond en velours.",
  lesson: "Un couple élégant dans un décor romantique et tamisé, avec des lumières douces et des touches luxueuses. Une atmosphère intime dans un style contemporain.",
  question: "Un écran élégant avec une question au centre, entouré d'éléments visuels représentant la thématique du Love Hôtel : miroirs au plafond, pétales de rose, lumière douce, et un design raffiné. Le texte de la question est écrit en police élégante.",
  correct: "Une animation lumineuse de couleur or ou verte pour indiquer une réponse correcte, avec des confettis et un compteur de 100 tokens gagnés affiché en bas. Le tout dans une ambiance romantique et raffinée.",
  incorrect: "Une animation subtile en rouge ou gris indiquant une réponse incorrecte, avec un texte doux pour encourager à réessayer. Le fond reste élégant et dans le style des Love Hôtels.",
  results: "Un écran montrant le score final avec des tokens gagnés, sur un fond glamour. Ajoutez une option pour rejouer ou explorer les offres spéciales des Love Hôtels. Style luxueux avec des roses et une lumière tamisée."
};

const lessons = [
  {
    title: "Bienvenue au Love Hotel",
    content: "Le Love Hotel est un concept unique offrant un espace intime et luxueux pour les couples. Découvrez nos différentes thématiques et services exclusifs.",
    imagePrompt: "Un couple élégant dans un décor romantique et tamisé"
  },
  {
    title: "Restaurant Eat & Love",
    content: "Notre restaurant vous propose une expérience gastronomique romantique avec des plats raffinés et une carte des vins soigneusement sélectionnée.",
    imagePrompt: "Un dîner romantique pour deux dans un restaurant chic"
  },
  {
    title: "Les Love Rooms",
    content: "Nos chambres thématiques sont équipées pour votre confort et votre plaisir, avec des designs uniques et des équipements premium.",
    imagePrompt: "Une chambre d'hôtel luxueuse et thématique"
  }
];

const questions = [
  {
    question: "Qu'est-ce qui caractérise principalement un Love Hotel ?",
    options: [
      "Un espace intime et luxueux pour les couples",
      "Un hôtel standard avec restaurant",
      "Un centre de conférences",
    ],
    answer: 0,
  },
  {
    question: "Que propose le restaurant Eat & Love ?",
    options: [
      "De la restauration rapide",
      "Une expérience gastronomique romantique",
      "Des buffets à volonté",
    ],
    answer: 1,
  },
  {
    question: "Quels équipements peut-on trouver dans nos Love Rooms ?",
    options: [
      "Un simple lit standard",
      "Des équipements premium et thématiques",
      "Des bureaux de travail",
    ],
    answer: 1,
  },
  {
    question: "Quelle est la particularité de notre service ?",
    options: [
      "L'anonymat et la discrétion",
      "Les réunions d'affaires",
      "Les activités sportives",
    ],
    answer: 0,
  },
  {
    question: "Comment fonctionne notre système de réservation ?",
    options: [
      "Réservation uniquement sur place",
      "Réservation en ligne avec choix de la thématique",
      "Réservation par téléphone uniquement",
    ],
    answer: 1,
  }
];

const SimpleQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [images, setImages] = useState<Record<string, string>>({});
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showLessons, setShowLessons] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const generateImages = async () => {
      try {
        const imagePromises = Object.entries(prompts).map(async ([key, prompt]) => {
          const response = await fetch(
            'https://cmxmnsgbmhgpgxopmtua.functions.supabase.co/generate-quiz-image',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ prompt }),
            }
          );
          const data = await response.json();
          return [key, data.imageUrl];
        });

        const generatedImages = Object.fromEntries(await Promise.all(imagePromises));
        setImages(generatedImages);
      } catch (error) {
        console.error('Error generating images:', error);
        toast({
          title: "Erreur",
          description: "Impossible de générer les images du quiz",
          variant: "destructive",
        });
      }
    };

    generateImages();
  }, []);

  const updatePoints = async (earnedPoints: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour gagner des points",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        'https://cmxmnsgbmhgpgxopmtua.functions.supabase.co/update-points',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ points: earnedPoints }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update points');
      }

      const data = await response.json();
      
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

  const handleNextLesson = () => {
    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
    } else {
      setShowLessons(false);
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

  if (showLessons) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <Card className="p-6 shadow-lg relative overflow-hidden">
          {images['lesson'] && (
            <img
              src={images['lesson']}
              alt="Lesson background"
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <h2 className="text-2xl font-semibold mb-4 text-center font-cormorant">
              {lessons[currentLesson].title}
            </h2>
            <p className="text-lg mb-6 text-center font-montserrat">
              {lessons[currentLesson].content}
            </p>
            <div className="flex justify-center">
              <Button onClick={handleNextLesson} className="font-montserrat">
                {currentLesson < lessons.length - 1 ? "Leçon suivante" : "Commencer le quiz"}
              </Button>
            </div>
          </motion.div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card className="p-6 shadow-lg relative overflow-hidden">
        {images[showResult ? 'results' : 'question'] && (
          <img
            src={images[showResult ? 'results' : 'question']}
            alt="Quiz background"
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          {!showResult ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4 text-center font-cormorant">
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
                      className="w-full text-left py-4 px-6 font-montserrat"
                      onClick={() => handleAnswer(index)}
                    >
                      {option}
                    </Button>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-500 text-center">
                Question {currentQuestion + 1} sur {questions.length}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4 font-cormorant">Quiz Terminé !</h2>
              <p className="text-lg mb-6 font-montserrat">
                Score : {score} points
              </p>
              <Button
                onClick={() => {
                  setCurrentQuestion(0);
                  setScore(0);
                  setShowResult(false);
                  setShowLessons(true);
                  setCurrentLesson(0);
                }}
                className="font-montserrat"
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