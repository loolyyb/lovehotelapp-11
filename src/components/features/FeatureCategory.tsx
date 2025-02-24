
import { motion } from "framer-motion";
import { FeatureCard } from "./FeatureCard";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  memberOnly?: boolean;
  tooltipText: string;
}

interface FeatureCategoryProps {
  title: string;
  features: Feature[];
  categoryIndex: number;
}

export const FeatureCategory = ({ title, features, categoryIndex }: FeatureCategoryProps) => {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: categoryIndex * 0.2 }}
      className="mb-16"
    >
      <Button
        onClick={scrollToContact}
        variant="link"
        className="mb-8 mx-auto block text-burgundy hover:text-burgundy/80"
      >
        Nous contacter
      </Button>
      
      <h2 className="text-3xl font-cormorant font-bold text-burgundy mb-8 text-center">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            {...feature}
          />
        ))}
      </div>
    </motion.div>
  );
};
