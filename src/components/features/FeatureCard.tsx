import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  memberOnly?: boolean;
  tooltipText: string;
}

export const FeatureCard = ({ icon: Icon, title, description, memberOnly, tooltipText }: FeatureCardProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ 
              scale: 1.03,
              transition: { duration: 0.2 }
            }}
            className="h-full"
          >
            <Card className="p-6 h-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 border-rose-100 hover:shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Icon className="w-8 h-8 text-burgundy" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-cormorant font-bold text-gray-900">
                      {title}
                    </h3>
                    {memberOnly && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-burgundy text-white">
                        Membres
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{description}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
