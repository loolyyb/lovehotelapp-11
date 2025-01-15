import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface IntroductionProps {
  onNext: (data: any) => void;
  loading?: boolean;
}

export function Introduction({ onNext, loading }: IntroductionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 text-center"
    >
      <h2 className="text-xl font-semibold text-burgundy">
        Bienvenue dans votre parcours de qualification
      </h2>
      
      <p className="text-gray-600">
        Ce parcours nous permettra de mieux comprendre vos attentes pour personnaliser votre expérience.
      </p>

      <Button
        onClick={() => onNext({})}
        className="w-full"
        disabled={loading}
      >
        Commencer
      </Button>
    </motion.div>
  );
}