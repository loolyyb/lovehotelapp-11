import { motion } from "framer-motion";
import { RelationshipStatusIcon } from "../RelationshipStatusIcon";
import { Heart, User, Users } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
interface ProfileInfoProps {
  fullName?: string | null;
  bio?: string | null;
  sexualOrientation?: string | null;
  seeking?: string[] | null;
  relationshipType?: string[] | null;
}
export function ProfileInfo({
  fullName,
  bio,
  sexualOrientation,
  seeking,
  relationshipType
}: ProfileInfoProps) {
  const getOrientationLabel = (orientation: string | null) => {
    switch (orientation) {
      case "straight":
        return "Hétérosexuel(le)";
      case "gay":
        return "Homosexuel(le)";
      case "bisexual":
        return "Bisexuel(le)";
      case "pansexual":
        return "Pansexuel(le)";
      default:
        return "Non spécifié";
    }
  };
  const getSeekingLabel = (value: string) => {
    switch (value) {
      case "single_man":
        return {
          label: "Un homme",
          icon: <User className="w-4 h-4" />
        };
      case "single_woman":
        return {
          label: "Une femme",
          icon: <User className="w-4 h-4" />
        };
      case "couple_mf":
        return {
          label: "Un couple (homme-femme)",
          icon: <Users className="w-4 h-4" />
        };
      case "couple_mm":
        return {
          label: "Un couple (homme-homme)",
          icon: <Users className="w-4 h-4" />
        };
      case "couple_ff":
        return {
          label: "Un couple (femme-femme)",
          icon: <Users className="w-4 h-4" />
        };
      default:
        return {
          label: value,
          icon: <User className="w-4 h-4" />
        };
    }
  };
  return <motion.div className="text-center space-y-4" initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.5
  }}>
      <motion.h1 initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.3
    }} className="text-3xl md:text-4xl font-bold font-cormorant text-zinc-50">
        {fullName || 'Anonyme'}
      </motion.h1>

      <motion.div className="flex items-center justify-center space-x-4" initial={{
      opacity: 0,
      scale: 0.8
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      delay: 0.4
    }}>
        {relationshipType && relationshipType.length > 0 && <motion.div whileHover={{
        scale: 1.1
      }} whileTap={{
        scale: 0.95
      }}>
            <RelationshipStatusIcon type={relationshipType[0] as "casual" | "serious" | "libertine" | null} />
          </motion.div>}
        
        {sexualOrientation && <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <motion.div className="bg-rose/20 rounded-full p-2 hover:bg-rose/30 transition-colors" whileHover={{
              scale: 1.1
            }} whileTap={{
              scale: 0.95
            }}>
                  <Heart className="w-5 h-5 text-burgundy" />
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getOrientationLabel(sexualOrientation)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>}

        {seeking && seeking.length > 0 && <div className="flex gap-2">
            {seeking.map((item, index) => {
          const {
            label,
            icon
          } = getSeekingLabel(item);
          return <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger>
                      <motion.div className="bg-rose/20 rounded-full p-2 hover:bg-rose/30 transition-colors" whileHover={{
                  scale: 1.1
                }} whileTap={{
                  scale: 0.95
                }}>
                        {icon}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Recherche : {label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>;
        })}
          </div>}
      </motion.div>

      {bio && <motion.p initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 0.5
    }} className="max-w-2xl text-lg font-montserrat text-zinc-50">
          {bio}
        </motion.p>}
    </motion.div>;
}