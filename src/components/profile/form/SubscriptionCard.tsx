import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useApiAuth } from "@/hooks/useApiAuth";
import { ApiService } from "@/services/ApiService";
import { WidgetContainer } from "./WidgetContainer";

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

  return (
    <WidgetContainer title="Abonnement">
      <div className="p-4 bg-white/10 rounded-lg">
        <pre className="text-xs font-mono break-all whitespace-pre-wrap">
          {cardData ? JSON.stringify(cardData, null, 2) : 'Chargement des données...'}
        </pre>
      </div>
    </WidgetContainer>
  );
}