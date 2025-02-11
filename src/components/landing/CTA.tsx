import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const CTA = () => {
  return (
    <section className="py-24 bg-burgundy text-white px-4">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <span className="inline-block px-3 py-1 text-sm bg-white/10 rounded-full">
            Rejoignez-nous
          </span>
          <h2 className="text-4xl md:text-5xl font-cormorant font-bold">
            Commencez Votre Histoire d'Amour
          </h2>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Profitez d'avantages exclusifs : Love Rooms, Restaurant Lovers, 
            LooLyyb Coin et bien plus encore. Une nouvelle façon de vivre l'amour.
          </p>
          <div className="pt-8 space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center">
            <Button
              size="lg"
              className="bg-white text-burgundy hover:bg-white/10 text-lg"
            >
              Créer un Compte
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/90 text-lg"
            >
              Découvrir les Offres
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
