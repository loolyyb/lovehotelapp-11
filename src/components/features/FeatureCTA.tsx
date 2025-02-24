
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export const FeatureCTA = () => {
  const email = "eddigit@gmail.com";
  
  const handleEmailClick = () => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <motion.div 
      id="contact"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="text-center bg-[#ce0067] rounded-2xl p-8 md:p-12 shadow-xl relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('/lovable-uploads/531b1255-eea3-4f93-b94c-add902728806.png')] opacity-10 bg-cover bg-center mix-blend-overlay transform hover:scale-105 transition-transform duration-1000" />
      
      <div className="relative z-10 max-w-xl mx-auto space-y-6">
        <h2 className="text-3xl md:text-4xl font-cormorant font-bold text-[#F3EBAD] mb-6 [text-shadow:_0_2px_4px_rgb(0_0_0_/_30%)]">
          Contacter l'équipe développement
        </h2>
        
        <p className="text-[#F3EBAD] text-lg mb-6">
          Envoyez-nous un email à : <span className="font-semibold">{email}</span>
        </p>

        <Button 
          onClick={handleEmailClick}
          className="bg-white/10 hover:bg-white/20 text-[#F3EBAD] border-2 border-[#F3EBAD] transition-all duration-300 transform hover:scale-105 font-semibold"
        >
          <Mail className="w-5 h-5 mr-2" />
          Nous contacter par email
        </Button>
      </div>
    </motion.div>
  );
};
