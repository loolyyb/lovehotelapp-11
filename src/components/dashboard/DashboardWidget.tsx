
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface DashboardWidgetProps {
  icon: LucideIcon;
  title: string;
  to: string;
}

export const DashboardWidget = ({
  icon: Icon,
  title,
  to
}: DashboardWidgetProps) => {
  return (
    <Link to={to} className="h-[180px]">
      <motion.div 
        whileHover={{
          scale: 1.02,
          transition: {
            duration: 0.2
          }
        }} 
        className="backdrop-blur-sm rounded-xl p-6 flex flex-col items-center justify-center h-full cursor-pointer group border-[0.5px] border-[#f3ebad]/30 hover:shadow-lg transition-all duration-300 bg-[#40192C]"
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <Icon 
            className="w-8 h-8 sm:w-10 sm:h-10 text-[#f3ebad] transition-transform duration-300 group-hover:scale-110" 
            strokeWidth={1.5} 
          />
          <h3 className="text-base sm:text-lg font-cormorant font-semibold text-[#f3ebad] text-center truncate w-full px-2">
            {title}
          </h3>
        </div>
      </motion.div>
    </Link>
  );
};
