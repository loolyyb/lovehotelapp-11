
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
        className="glass-card rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center h-[120px] sm:h-[140px] cursor-pointer group"
      >
        <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
          <Icon 
            className="w-6 h-6 sm:w-10 sm:h-10 text-rose-500 transition-transform duration-300 group-hover:scale-110" 
            strokeWidth={1.5}
          />
          <h3 className="text-base sm:text-lg font-cormorant font-semibold text-rose-500 text-center truncate w-full px-2">{title}</h3>
        </div>
      </motion.div>
    </Link>
  );
};

