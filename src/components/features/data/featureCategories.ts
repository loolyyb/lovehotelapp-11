
import { Crown, Heart, Hotel, Coins, Utensils, Calendar, Users, Lock, MessageCircle, Gift, Star, Sparkles } from "lucide-react";
import { FeatureCategory } from "../types/feature.types";

export const featureCategories: FeatureCategory[] = [
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
