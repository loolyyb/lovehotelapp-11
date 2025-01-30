import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Heart, 
  Hotel, 
  Coins, 
  Calendar, 
  Users, 
  Crown 
} from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: <Hotel className="w-12 h-12 text-burgundy" />,
      title: "Love Rooms",
      description: "Des chambres luxueuses pour vos moments romantiques"
    },
    {
      icon: <Coins className="w-12 h-12 text-burgundy" />,
      title: "LooLyyb Coin",
      description: "La première monnaie dédiée aux amoureux"
    },
    {
      icon: <Calendar className="w-12 h-12 text-burgundy" />,
      title: "Events VIP",
      description: "Des événements exclusifs pour nos membres"
    },
    {
      icon: <Users className="w-12 h-12 text-burgundy" />,
      title: "Communauté",
      description: "Rejoignez une communauté de passionnés"
    },
    {
      icon: <Crown className="w-12 h-12 text-burgundy" />,
      title: "Conciergerie",
      description: "Un service sur mesure pour vos demandes"
    },
    {
      icon: <Heart className="w-12 h-12 text-burgundy" />,
      title: "Expériences",
      description: "Des moments uniques à partager"
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-cormorant font-bold text-gray-900 mb-4">
            Nos Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez tous les avantages exclusifs réservés à nos membres
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                {feature.icon}
                <h3 className="mt-4 text-xl font-cormorant font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <Button 
            size="lg"
            className="bg-burgundy hover:bg-burgundy/90 text-white"
          >
            Découvrir tous nos services
          </Button>
        </motion.div>
      </div>
    </section>
  );
};