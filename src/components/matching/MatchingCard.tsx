
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, User, Users } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const DEFAULT_AVATAR_URL = "https://lovehotelapp.com/wp-content/uploads/2025/02/avatar-love-hotel-v2.jpg";

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  compatibility_score?: number;
  status?: string | null;
}

interface MatchingCardProps {
  profile: Profile;
  onProfileClick: (id: string) => void;
  onMessageClick: (id: string) => void;
  index: number;
}

export function MatchingCard({
  profile,
  onProfileClick,
  onMessageClick,
  index
}: MatchingCardProps) {
  const getStatusInfo = (statusValue: string | null | undefined) => {
    switch (statusValue) {
      case "single_man":
        return {
          label: "Homme célibataire",
          icon: <User className="w-3 h-3 text-blue-500" />
        };
      case "married_man":
        return {
          label: "Homme en couple",
          icon: <User className="w-3 h-3 text-blue-500" />
        };
      case "single_woman":
        return {
          label: "Femme célibataire",
          icon: <User className="w-3 h-3 text-pink-500" />
        };
      case "married_woman":
        return {
          label: "Femme en couple",
          icon: <User className="w-3 h-3 text-pink-500" />
        };
      case "couple_mf":
        return {
          label: "Couple (homme-femme)",
          icon: <Users className="w-3 h-3 text-purple-500" />
        };
      case "couple_mm":
        return {
          label: "Couple (homme-homme)",
          icon: <Users className="w-3 h-3 text-blue-500" />
        };
      case "couple_ff":
        return {
          label: "Couple (femme-femme)",
          icon: <Users className="w-3 h-3 text-pink-500" />
        };
      default:
        return null;
    }
  };

  const statusInfo = profile.status ? getStatusInfo(profile.status) : null;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.3,
        delay: index * 0.1
      }}
      className="h-[220px]"
    >
      <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 bg-[#40192C] border-[0.5px] border-[#f3ebad]/30 backdrop-blur-sm">
        <div className="p-6 space-y-4 h-full flex flex-col">
          <div
            className="flex items-center space-x-4 cursor-pointer flex-grow"
            onClick={() => onProfileClick(profile.id)}
          >
            <div className="relative">
              <img
                src={profile.avatar_url || DEFAULT_AVATAR_URL}
                alt={profile.full_name}
                className="w-36 h-36 rounded-full object-cover"
              />
              <div className="absolute -top-2 -right-2 text-white text-xs rounded-full h-10 w-10 flex items-center justify-center font-bold bg-[#ce0067]">
                {profile.compatibility_score}%
              </div>
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {profile.full_name}
                {statusInfo && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="bg-rose/20 rounded-full p-1 hover:bg-rose/30 transition-colors">
                          {statusInfo.icon}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{statusInfo.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </h3>
              <p className="text-sm text-gray-200 line-clamp-2">{profile.bio}</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-[#f3ebad] hover:bg-white/10"
              onClick={() => onProfileClick(profile.id)}
            >
              <Heart className="w-5 h-5 mr-2" />
              Profil
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-[#f3ebad] hover:bg-white/10"
              onClick={() => onMessageClick(profile.id)}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Message
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
