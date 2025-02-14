
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";
import { Header } from "@/components/landing/Header";
import { motion } from "framer-motion";

const Index = () => {
  console.log("Rendu du composant Index");
  
  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#40192C] flex flex-col relative overflow-hidden"
    >
      {/* Backdrop overlay with pattern and blur */}
      <div className="absolute inset-0 backdrop-blur-sm z-0">
        <div className="absolute inset-0 bg-[#40192C]/80" />
        <div className="absolute inset-0 border-[0.5px] border-[#f3ebad]/30" />
      </div>
      
      {/* Content wrapper */}
      <Header />
      <div className="flex-grow relative z-10 hover:shadow-lg transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <Hero />
          <Features />
          <CTA />
        </div>
      </div>

      {/* Floating decorative elements with the theme colors */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#f3ebad]/10 rounded-full mix-blend-soft-light filter blur-xl"
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1.1, opacity: 0.3 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#f3ebad]/10 rounded-full mix-blend-soft-light filter blur-xl"
        />
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 0.9, opacity: 0.35 }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 1 }}
          className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-[#f3ebad]/10 rounded-full mix-blend-soft-light filter blur-xl"
        />
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBoMzB2MzBIMzB6IiBmaWxsPSIjZjFmMWYxIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvZz48L3N2Zz4=')] opacity-10 z-0 pointer-events-none" />
    </motion.main>
  );
};

export default Index;
