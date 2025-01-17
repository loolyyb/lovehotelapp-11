import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Star, Award } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

interface ProfileCardProps {
  profile: Tables<"profiles">;
  preferences?: Tables<"preferences"> | null;
}

export function ProfileCard({ profile, preferences }: ProfileCardProps) {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/profile/${profile.id}`);
  };

  const renderInterestIcons = () => {
    const icons = [];
    
    if (preferences?.libertine_party_interest) {
      icons.push(
        <TooltipProvider key="libertine">
          <Tooltip>
            <TooltipTrigger>
              <Star className="w-5 h-5 text-rose-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Soirées libertines</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    if (preferences?.speed_dating_interest) {
      icons.push(
        <TooltipProvider key="speed">
          <Tooltip>
            <TooltipTrigger>
              <Award className="w-5 h-5 text-rose-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Speed dating</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (profile.is_love_hotel_member) {
      icons.push(
        <TooltipProvider key="member">
          <Tooltip>
            <TooltipTrigger>
              <Heart className="w-5 h-5 text-rose-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Membre Love Hotel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return icons;
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fadeIn bg-white/80 backdrop-blur-sm cursor-pointer transform hover:scale-105 transition-all h-[280px]"
      onClick={handleProfileClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleProfileClick();
        }
      }}
    >
      <CardContent className="p-6 flex flex-col items-center justify-between h-full">
        <Avatar className="w-32 h-32 border-4 border-rose shadow-lg">
          <AvatarImage 
            src={profile.avatar_url ?? undefined} 
            alt={profile.full_name ?? "Profile"} 
            className="object-cover"
          />
          <AvatarFallback className="text-2xl bg-burgundy text-white">
            {profile.full_name?.charAt(0) ?? "?"}
          </AvatarFallback>
        </Avatar>

        <div className="text-center">
          <h3 className="text-xl font-semibold text-burgundy mb-4">
            {profile.full_name}
          </h3>

          <div className="flex items-center justify-center space-x-3">
            {renderInterestIcons()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}