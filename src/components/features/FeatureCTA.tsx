import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const FeatureCTA = () => {
  const navigate = useNavigate();

  return (
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
            className="bg-white text-rose-500 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 font-semibold"
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
  );
};
