import { motion } from "framer-motion";

export const FeatureHeader = () => {
  return (
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
  );
};