import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Coins, Hotel, Utensils, Calendar } from "lucide-react";

export const Hero = () => {
  return (
    <section className="min-h-screen pt-24 flex items-center justify-center bg-gradient-to-b from-champagne to-cream px-4">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <span className="inline-block px-3 py-1 text-sm text-burgundy bg-rose/20 rounded-full">
            Une Expérience Unique
          </span>
          <h1 className="text-5xl md:text-7xl font-cormorant text-burgundy font-bold leading-tight">
            L'Amour en Mode
            <br /> Premium
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez une nouvelle façon de rencontrer l'amour avec des expériences exclusives et une monnaie dédiée.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm"
            >
              <Hotel className="w-8 h-8 text-burgundy mx-auto mb-3" />
              <h3 className="font-cormorant text-lg font-semibold">Love Rooms</h3>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm"
            >
              <Coins className="w-8 h-8 text-burgundy mx-auto mb-3" />
              <h3 className="font-cormorant text-lg font-semibold">LooLyyb Coin</h3>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm"
            >
              <Utensils className="w-8 h-8 text-burgundy mx-auto mb-3" />
              <h3 className="font-cormorant text-lg font-semibold">Restaurant Lovers</h3>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm"
            >
              <Calendar className="w-8 h-8 text-burgundy mx-auto mb-3" />
              <h3 className="font-cormorant text-lg font-semibold">Events Exclusifs</h3>
            </motion.div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              size="lg"
              className="bg-burgundy hover:bg-burgundy/90 text-white text-lg"
            >
              Rejoindre l'Aventure
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-burgundy text-burgundy hover:bg-burgundy/5 text-lg"
            >
              En Savoir Plus
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};