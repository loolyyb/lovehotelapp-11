import { motion } from "framer-motion";
import { ReactNode } from "react";

interface WidgetContainerProps {
  children: ReactNode;
  title: string;
}

export function WidgetContainer({ children, title }: WidgetContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6 space-y-4"
    >
      <h2 className="text-2xl font-cormorant font-semibold text-burgundy">{title}</h2>
      {children}
    </motion.div>
  );
}