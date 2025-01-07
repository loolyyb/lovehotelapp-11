import { WidgetContainer } from "./WidgetContainer";
import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";

interface SubscriptionCardProps {
  membershipType?: string;
  memberSince?: string;
  cardNumber?: string;
}

export function SubscriptionCard({ 
  membershipType = "Love Hotel Member", 
  memberSince = "2024", 
  cardNumber = "****-****-****-1234" 
}: SubscriptionCardProps) {
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
    </WidgetContainer>
  );
}