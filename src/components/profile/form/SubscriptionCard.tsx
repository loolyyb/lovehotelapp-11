import { WidgetContainer } from "./WidgetContainer";
import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";
import { useSubscriptionCard } from "@/hooks/useSubscriptionCard";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SubscriptionCardProps {
  membershipType?: string;
  memberSince?: string;
  cardNumber?: string;
}

export function SubscriptionCard({ 
  membershipType = "Standard", 
  memberSince = "2024", 
  cardNumber = "****-****-****-1234" 
}: SubscriptionCardProps) {
  const { data, isLoading, error } = useSubscriptionCard();

  return (
    <WidgetContainer title="Carte Abonnement">
      <div className="space-y-4">
        {isLoading && (
          <div className="text-sm text-gray-500">
            Chargement des données de la carte...
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              Erreur lors de la récupération des données de la carte: {error.message}
            </AlertDescription>
          </Alert>
        )}

        <motion.div 
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] p-6 text-white shadow-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute top-0 right-0 p-4">
            <CreditCard className="h-8 w-8 opacity-50" />
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-light opacity-80">Membre depuis</p>
              <p className="font-semibold">{memberSince}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-light opacity-80">Type d'abonnement</p>
              <p className="font-semibold">{membershipType}</p>
            </div>
            
            <div className="pt-4 space-y-1">
              <p className="text-sm font-light opacity-80">Numéro de carte</p>
              <p className="font-mono text-lg tracking-wider">{cardNumber}</p>
            </div>
          </div>
        </motion.div>

        {data && (
          <div className="mt-4 p-4 bg-white/10 rounded-lg">
            <p className="text-sm font-light mb-2">Données brutes de l'API :</p>
            <pre className="text-xs overflow-auto max-h-60 bg-gray-100 p-4 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </WidgetContainer>
  );
}