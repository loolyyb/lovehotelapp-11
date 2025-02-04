import { motion } from "framer-motion";
import { Heart, Lock, Hotel, Coins, Utensils, Calendar, Users, Crown } from "lucide-react";

const features = [
  {
    icon: Hotel,
    title: "Love Rooms",
    description:
      "Réservez des chambres luxueuses pour vos moments romantiques.",
  },
  {
    icon: Coins,
    title: "LooLyyb Coin",
    description:
      "Une monnaie dédiée aux amoureux pour des expériences uniques.",
  },
  {
    icon: Utensils,
    title: "Restaurant Lovers",
    description:
      "Un restaurant exclusif pour des dîners romantiques mémorables.",
  },
  {
    icon: Calendar,
    title: "Events Exclusifs",
    description:
      "Speed dating, soirées à thème et événements VIP réguliers.",
  },
  {
    icon: Crown,
    title: "Expérience Premium",
    description:
      "Un service haut de gamme pour des rencontres de qualité.",
  },
  {
    icon: Users,
    title: "Communauté Select",
    description:
      "Rejoignez une communauté de célibataires raffinés et authentiques.",
  },
  {
    icon: Heart,
    title: "Matching Intelligent",
    description:
      "Un algorithme sophistiqué pour des rencontres qui vous correspondent.",
  },
  {
    icon: Lock,
    title: "Confidentialité",
    description:
      "Votre vie privée est notre priorité absolue.",
  },
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