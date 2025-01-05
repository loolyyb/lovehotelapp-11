import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";
import { Header } from "@/components/landing/Header";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-champagne to-cream flex flex-col relative overflow-hidden"
    >
      {/* Background blur effect */}
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-0" />
      
      {/* Content wrapper */}
      <Header />
      <div className="flex-grow relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <Hero />
          <Features />
          <CTA />
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-rose-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-burgundy-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-champagne rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>
    </motion.main>
  );
};

export default Index;