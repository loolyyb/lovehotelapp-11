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
    <Link to={to} className="h-full">
      <motion.div
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className="glass-card rounded-xl p-3 sm:p-8 flex flex-col items-center justify-center gap-2 sm:gap-6 h-full cursor-pointer group"
      >
        <div className="relative">
          <Icon 
            className="w-8 h-8 sm:w-16 sm:h-16 text-burgundy transition-transform duration-300 group-hover:scale-110" 
            strokeWidth={1.5}
          />
        </div>
        <h3 className="text-lg sm:text-2xl font-cormorant font-semibold text-burgundy text-center whitespace-nowrap">{title}</h3>
      </motion.div>
    </Link>
  );
};