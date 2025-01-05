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
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-0" />
      <Header />
      <div className="flex-grow relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <Hero />
          <Features />
          <CTA />
        </div>
      </div>
    </motion.main>
  );
};

export default Index;