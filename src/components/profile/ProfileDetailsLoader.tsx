import { motion } from "framer-motion";

export function ProfileDetailsLoader() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100 flex items-center justify-center"
    >
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-burgundy font-semibold text-lg"
      >
        Chargement...
      </motion.div>
    </motion.div>
  );
}