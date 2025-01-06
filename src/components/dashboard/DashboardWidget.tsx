import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface DashboardWidgetProps {
  icon: LucideIcon;
  title: string;
  to: string;
}

export const DashboardWidget = ({ icon: Icon, title, to }: DashboardWidgetProps) => {
  return (
    <Link to={to}>
      <motion.div
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className="glass-card p-6 flex flex-col items-center justify-center gap-4 min-h-[200px] cursor-pointer group"
      >
        <div className="relative">
          <Icon 
            className="w-12 h-12 text-burgundy transition-transform duration-300 group-hover:scale-110" 
            strokeWidth={1.5}
          />
        </div>
        <h3 className="text-xl font-cormorant font-semibold text-burgundy">{title}</h3>
      </motion.div>
    </Link>
  );
};