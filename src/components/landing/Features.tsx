import { motion } from "framer-motion";
import { 
  Heart, Lock, Hotel, Coins, Utensils, Calendar, Users, Crown,
  MessageCircle, Gift, Star, Sparkles, Search, Shield, Headphones,
  PartyPopper, Wine, Coffee
} from "lucide-react";

const features = [
  {
    icon: Hotel,
    title: "Love Rooms",
    description:
      "Chambres thématiques luxueuses pour des moments inoubliables.",
  },
  {
    icon: Coins,
    title: "LooLyyb Coin",
    description:
      "Monnaie exclusive pour accéder à des services premium.",
  },
  {
    icon: Utensils,
    title: "Restaurant Lovers",
    description:
      "Expérience gastronomique romantique dans un cadre intimiste.",
  },
  {
    icon: Calendar,
    title: "Events Exclusifs",
    description:
      "Soirées privées, speed dating et événements thématiques.",
  },
  {
    icon: MessageCircle,
    title: "Messagerie Privée",
    description:
      "Échangez en toute confidentialité avec d'autres membres.",
  },
  {
    icon: Users,
    title: "Communauté Select",
    description:
      "Rencontrez des célibataires authentiques et raffinés.",
  },
  {
    icon: Heart,
    title: "Matching Intelligent",
    description:
      "Algorithme sophistiqué pour des rencontres compatibles.",
  },
  {
    icon: Lock,
    title: "Confidentialité",
    description:
      "Protection maximale de vos données et de votre vie privée.",
  },
  {
    icon: Crown,
    title: "Statut Premium",
    description:
      "Accès privilégié à des fonctionnalités exclusives.",
  },
  {
    icon: Gift,
    title: "Programme Fidélité",
    description:
      "Gagnez des points et débloquez des avantages exclusifs.",
  },
  {
    icon: Search,
    title: "Recherche Avancée",
    description:
      "Filtres détaillés pour trouver votre match idéal.",
  },
  {
    icon: Shield,
    title: "Profils Vérifiés",
    description:
      "Communauté sécurisée avec vérification des membres.",
  },
  {
    icon: Headphones,
    title: "Conciergerie",
    description:
      "Service personnalisé pour organiser vos moments spéciaux.",
  },
  {
    icon: PartyPopper,
    title: "Événements Libertins",
    description:
      "Soirées exclusives pour explorer vos fantasmes.",
  },
  {
    icon: Wine,
    title: "Bar Lounge",
    description:
      "Espace cosy pour des rencontres décontractées.",
  },
  {
    icon: Coffee,
    title: "Speed Dating",
    description:
      "Rencontres rapides dans un cadre élégant.",
  }
];

export const Features = () => {
  return (
    <section className="py-24 bg-white px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-burgundy text-sm font-medium"
          >
            Nos Services Premium
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-cormorant font-bold mt-2 text-gray-900"
          >
            Une Expérience Unique
          </motion.h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-xl bg-cream/50 hover:bg-cream transition-colors duration-300 shadow-lg"
            >
              <feature.icon className="w-12 h-12 text-burgundy mb-4" />
              <h3 className="text-xl font-cormorant font-bold mb-2 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600 font-montserrat">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};