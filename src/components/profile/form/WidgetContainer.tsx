import { motion } from "framer-motion";

interface WidgetContainerProps {
  children: React.ReactNode;
  title: string;
}

export function WidgetContainer({ children, title }: WidgetContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6 space-y-4 w-full"
    >
      <h2 className="text-2xl font-cormorant font-semibold text-burgundy">{title}</h2>
      {children}
    </motion.div>
  );
}