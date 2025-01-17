import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Coins, Hotel, Utensils, Calendar, Users, Heart, Crown, Gift, Star } from "lucide-react";

export const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-champagne to-cream relative overflow-hidden">
      {/* Header Image */}
      <div className="w-full h-[60vh] relative overflow-hidden">
        <img 
          src="https://dev.lovehotelaparis.com/wp-content/uploads/2025/01/model-love-hotel-app.png"
          alt="Love Hotel App"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="text-center text-white">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-cormorant font-bold leading-tight mb-6"
            >
              L'application Love Hôtel 2025
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl max-w-2xl mx-auto mb-8"
            >
              Découvrez une nouvelle façon unique de faire des rencontres et mettre du piment dans votre intimité
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="bg-white text-gray-800 hover:bg-white/90 text-lg font-semibold"
              >
                Rejoindre l'Aventure
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white bg-white/80 text-gray-800 hover:bg-white text-lg font-semibold"
              >
                En Savoir Plus
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="w-full max-w-7xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm flex flex-col items-center"
          >
            <Hotel className="w-12 h-12 text-burgundy mb-3" />
            <h3 className="font-cormorant text-xl font-semibold">Love Rooms</h3>
            <p className="text-sm text-gray-600 mt-2">Des chambres luxueuses pour vos moments romantiques</p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm flex flex-col items-center"
          >
            <Coins className="w-12 h-12 text-burgundy mb-3" />
            <h3 className="font-cormorant text-xl font-semibold">LooLyyb Coin</h3>
            <p className="text-sm text-gray-600 mt-2">La première monnaie dédiée aux amoureux</p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm flex flex-col items-center"
          >
            <Utensils className="w-12 h-12 text-burgundy mb-3" />
            <h3 className="font-cormorant text-xl font-semibold">Restaurant Lovers</h3>
            <p className="text-sm text-gray-600 mt-2">Une expérience gastronomique romantique</p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm flex flex-col items-center"
          >
            <Crown className="w-12 h-12 text-burgundy mb-3" />
            <h3 className="font-cormorant text-xl font-semibold">Conciergerie Lovers</h3>
            <p className="text-sm text-gray-600 mt-2">Un service sur mesure pour vos demandes spéciales</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm flex flex-col items-center"
          >
            <Calendar className="w-12 h-12 text-burgundy mb-3" />
            <h3 className="font-cormorant text-xl font-semibold">Events VIP</h3>
            <p className="text-sm text-gray-600 mt-2">Invitations exclusives pour nos membres</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm flex flex-col items-center"
          >
            <Gift className="w-12 h-12 text-burgundy mb-3" />
            <h3 className="font-cormorant text-xl font-semibold">Récompenses Crypto</h3>
            <p className="text-sm text-gray-600 mt-2">Gagnez des récompenses en cryptomonnaie</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Background Illustrations */}
      <div className="absolute inset-0 pointer-events-none opacity-5 z-0">
        <div className="absolute top-20 left-10 w-64 h-64">
          <Heart className="w-full h-full text-burgundy" />
        </div>
        <div className="absolute bottom-20 right-10 w-48 h-48">
          <Hotel className="w-full h-full text-burgundy" />
        </div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40">
          <Coins className="w-full h-full text-burgundy" />
        </div>
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56">
          <Utensils className="w-full h-full text-burgundy" />
        </div>
      </div>
    </section>
  );
};