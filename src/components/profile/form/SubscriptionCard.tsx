import { WidgetContainer } from "./WidgetContainer";
import { motion } from "framer-motion";
import { CreditCard, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useApiAuth } from "@/hooks/useApiAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ApiService } from "@/services/ApiService";

interface SubscriptionCardProps {
  membershipType?: string;
  memberSince?: string;
  cardNumber?: string;
  username?: string;
  remainingHours?: number;
}

export function SubscriptionCard({ 
  membershipType = "Love Hotel Member", 
  memberSince = "2024", 
  cardNumber = "****-****-****-1234",
  username = "Membre",
  remainingHours = 10
}: SubscriptionCardProps) {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useApiAuth();
  const [cardData, setCardData] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUserEmail();
  }, []);

  useEffect(() => {
    const fetchCardData = async () => {
      if (isAuthenticated && userEmail) {
        try {
          const url = `/cards?email=${encodeURIComponent(userEmail)}&order[id]=&page=1&perPage=1000&temp=false`;
          const data = await ApiService.get(url);
          setCardData(data);
        } catch (error) {
          console.error('Error fetching card data:', error);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de récupérer les données de la carte.",
          });
        }
      }
    };

    fetchCardData();
  }, [isAuthenticated, userEmail]);

  const handleRenewal = () => {
    toast({
      title: "Renouvellement",
      description: "La fonctionnalité de renouvellement sera bientôt disponible.",
    });
  };

  return (
    <WidgetContainer title="Carte Abonnement">
      <motion.div 
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] p-6 text-white shadow-lg"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute top-0 right-0 p-4">
          <CreditCard className="h-8 w-8 opacity-50" />
        </div>
        
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-sm font-light opacity-80">Membre depuis</p>
            <p className="font-semibold">{memberSince}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-2xl font-bold">{username}</p>
            <p className="text-sm font-light opacity-80">Type d'abonnement</p>
            <p className="font-semibold">{membershipType}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 opacity-80" />
            <p className="font-semibold">{remainingHours}h restantes</p>
          </div>
          
          <div className="pt-4 space-y-1">
            <p className="text-sm font-light opacity-80">Numéro de carte</p>
            <p className="font-mono text-lg tracking-wider">{cardNumber}</p>
          </div>

          {cardData && (
            <div className="mt-4 p-2 bg-white/10 rounded-lg">
              <p className="text-xs font-mono break-all">
                {JSON.stringify(cardData, null, 2)}
              </p>
            </div>
          )}

          <Button 
            onClick={handleRenewal}
            className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
          >
            Renouveller
          </Button>
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shine" />
      </motion.div>
    </WidgetContainer>
  );
}