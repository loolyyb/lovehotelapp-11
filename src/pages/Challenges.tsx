import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: 'quiz' | 'puzzle' | 'photo' | 'activity';
  points: number;
  requirements: string[];
}

export default function Challenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const { data, error } = await supabase
          .from('challenges')
          .select('*')
          .order('points', { ascending: false });

        if (error) throw error;
        setChallenges(data || []);
      } catch (error) {
        console.error('Error fetching challenges:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les défis",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [toast]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-8 h-8 text-burgundy" />
        <h1 className="text-3xl font-bold text-burgundy">Défis en Couple</h1>
      </div>

      <div className="bg-cream/50 p-6 rounded-lg mb-8 shadow-sm">
        <p className="text-gray-700 font-montserrat leading-relaxed">
          Découvrez nos défis excitants conçus pour les couples ! Participez à différents types de challenges - des quiz coquins aux défis photos sensuels, en passant par des activités ludiques à deux. À chaque défi relevé, gagnez des tokens LooLyyb, une cryptomonnaie innovante et prometteuse. Accumulez suffisamment de tokens pour bénéficier d'avantages exclusifs comme des abonnements gratuits, des réductions sur nos services, ou convertissez-les en argent réel. Plus vous relevez de défis, plus vos récompenses sont importantes !
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-20 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2">{challenge.title}</h3>
              <p className="text-gray-600 mb-4">{challenge.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-burgundy/10 text-burgundy">
                  {challenge.points} tokens
                </Badge>
                <Badge variant="outline">
                  {challenge.challenge_type}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}