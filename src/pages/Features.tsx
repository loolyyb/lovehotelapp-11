import { motion } from "framer-motion";
import { Crown, Heart, Hotel, Coins, Utensils, Calendar, Users, Lock, MessageCircle, Gift, Star, Sparkles, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Groupement des fonctionnalités par catégorie
const featureCategories = [
  {
    title: "Expériences Exclusives",
    features: [
      {
        icon: Hotel,
        title: "Love Rooms",
        description: "Réservez des chambres luxueuses pour vos moments romantiques.",
        memberOnly: true,
        tooltipText: "Réservé aux membres Love Hotel - Accès à des suites exclusives"
      },
      {
        icon: Coins,
        title: "LooLyyb Coin",
        description: "Notre monnaie exclusive pour les membres. Gagnez et dépensez des LooLyyb Coins pour des expériences uniques.",
        memberOnly: true,
        tooltipText: "Monnaie virtuelle exclusive pour les membres"
      },
      {
        icon: Utensils,
        title: "Restaurant Lovers",
        description: "Accédez à notre restaurant gastronomique et savourez des dîners romantiques.",
        memberOnly: true,
        tooltipText: "Restaurant exclusif réservé aux membres"
      },
    ]
  },
  {
    title: "Événements & Rencontres",
    features: [
      {
        icon: Calendar,
        title: "Événements Exclusifs",
        description: "Participez à nos soirées privées, speed dating et événements thématiques.",
        memberOnly: true,
        tooltipText: "Événements VIP réservés aux membres"
      },
      {
        icon: MessageCircle,
        title: "Messagerie Privée",
        description: "Échangez en toute confidentialité avec d'autres membres.",
        memberOnly: false,
        tooltipText: "Système de messagerie sécurisé"
      },
      {
        icon: Users,
        title: "Communauté Select",
        description: "Rejoignez une communauté de célibataires authentiques et raffinés.",
        memberOnly: false,
        tooltipText: "Communauté exclusive de célibataires"
      },
    ]
  },
  {
    title: "Avantages Premium",
    features: [
      {
        icon: Crown,
        title: "Statut Premium",
        description: "Accédez à des fonctionnalités exclusives et bénéficiez d'une visibilité accrue.",
        memberOnly: true,
        tooltipText: "Statut spécial avec avantages exclusifs"
      },
      {
        icon: Gift,
        title: "Récompenses",
        description: "Gagnez des points et débloquez des avantages exclusifs.",
        memberOnly: true,
        tooltipText: "Programme de fidélité exclusif"
      },
      {
        icon: Sparkles,
        title: "Expériences Uniques",
        description: "Découvrez des expériences romantiques sur mesure.",
        memberOnly: true,
        tooltipText: "Expériences personnalisées pour les membres"
      },
    ]
  },
  {
    title: "Sécurité & Confiance",
    features: [
      {
        icon: Heart,
        title: "Matching Intelligent",
        description: "Un algorithme sophistiqué pour des rencontres qui vous correspondent.",
        memberOnly: false,
        tooltipText: "Algorithme de matching avancé"
      },
      {
        icon: Star,
        title: "Profil Vérifié",
        description: "Bénéficiez d'un badge de confiance après vérification.",
        memberOnly: false,
        tooltipText: "Système de vérification des profils"
      },
      {
        icon: Lock,
        title: "Confidentialité",
        description: "Votre vie privée est notre priorité absolue.",
        memberOnly: false,
        tooltipText: "Protection maximale de vos données"
      },
    ]
  }
];

export default function Features() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-champagne via-rose-50 to-cream py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-cormorant font-bold text-burgundy mb-6">
            Découvrez Nos Fonctionnalités
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Une expérience de rencontre unique, alliant luxe, confidentialité et authenticité. 
            Créez votre compte pour accéder à toutes nos fonctionnalités exclusives.
          </p>
        </motion.div>

        {/* Features Grid par catégorie */}
        {featureCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: categoryIndex * 0.2 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-cormorant font-bold text-burgundy mb-8 text-center">
              {category.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category.features.map((feature, index) => (
                <TooltipProvider key={feature.title}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        whileHover={{ 
                          scale: 1.03,
                          transition: { duration: 0.2 }
                        }}
                        className="h-full"
                      >
                        <Card className="p-6 h-full bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 border-rose-100 hover:shadow-xl relative overflow-hidden group">
                          {/* Effet de brillance au hover */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shine_1.5s_ease-in-out_infinite]" />
                          </div>
                          
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <feature.icon className="w-8 h-8 text-burgundy" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-cormorant font-bold text-gray-900">
                                  {feature.title}
                                </h3>
                                {feature.memberOnly && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-burgundy text-white">
                                    Membres
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600">{feature.description}</p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{feature.tooltipText}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </motion.div>
        ))}

        {/* CTA Section avec parallaxe */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center bg-gradient-to-br from-burgundy-800 to-burgundy-900 rounded-2xl p-8 md:p-12 shadow-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('/lovable-uploads/531b1255-eea3-4f93-b94c-add902728806.png')] opacity-10 bg-cover bg-center mix-blend-overlay transform hover:scale-105 transition-transform duration-1000" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold text-white mb-6 [text-shadow:_0_2px_4px_rgb(0_0_0_/_30%)]">
              Prêt à Vivre l'Expérience ?
            </h2>
            <p className="text-lg text-white mb-8 max-w-2xl mx-auto">
              Rejoignez notre communauté exclusive et découvrez un nouveau monde de rencontres sophistiquées.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/login")}
                size="lg"
                className="bg-white text-burgundy-900 hover:bg-rose-50 transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                Créer un Compte
              </Button>
              <Button
                onClick={() => navigate("/login")}
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                Se Connecter
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}