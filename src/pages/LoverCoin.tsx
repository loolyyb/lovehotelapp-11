import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Crown, Lock, Users } from "lucide-react";

const features = [
  {
    icon: Crown,
    title: "Première Monnaie du Plaisir",
    description: "Une crypto-monnaie dédiée aux amoureux et libertins",
  },
  {
    icon: Lock,
    title: "Transactions Sécurisées",
    description: "Vos achats en toute discrétion",
  },
  {
    icon: Users,
    title: "Communauté Exclusive",
    description: "Rejoignez un cercle privilégié",
  },
  {
    icon: Crown,
    title: "Avantages Premium",
    description: "Accès prioritaire aux événements et services",
  },
];

const LoverCoin = () => {
  const handleBuyClick = () => {
    window.open('https://loolyyb-exchange.lovable.app/', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-burgundy-50 to-rose-50">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-cormorant font-bold text-burgundy mb-6">
            LooLyyb (LLGT)
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-montserrat mb-8">
            La première monnaie du plaisir dédiée aux amoureux, coquins et libertins
          </p>
          <Button
            size="lg"
            className="bg-burgundy hover:bg-burgundy/90 text-cream font-semibold px-8 py-6 text-lg"
            onClick={handleBuyClick}
          >
            En savoir plus
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-xl bg-white/50 hover:bg-white/80 transition-colors duration-300 shadow-lg"
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
    </div>
  );
};

export default LoverCoin;