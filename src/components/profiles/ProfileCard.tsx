import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Heart, Award, Star, Trophy } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfileCardProps {
  profile: Tables<"profiles">;
  preferences?: Tables<"preferences"> | null;
}

export function ProfileCard({ profile, preferences }: ProfileCardProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleProfileClick = () => {
    navigate(`/profile/${profile.id}`);
  };

  const renderMotivationIcons = () => {
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
              <Trophy className="w-5 h-5 text-rose-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Speed dating</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    if (preferences?.open_curtains_interest) {
      icons.push(
        <TooltipProvider key="curtains">
          <Tooltip>
            <TooltipTrigger>
              <Award className="w-5 h-5 text-rose-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Rideaux ouverts</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return icons;
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fadeIn bg-white/80 backdrop-blur-sm cursor-pointer transform hover:scale-105 transition-all"
      onClick={handleProfileClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleProfileClick();
        }
      }}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
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

          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-burgundy">
              {profile.full_name}
            </h3>

            {preferences?.location && !isMobile && (
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{preferences.location}</span>
              </div>
            )}

            {profile.bio && !isMobile && (
              <p className="text-gray-600 line-clamp-2 text-sm">
                {profile.bio}
              </p>
            )}

            <div className="flex items-center justify-center space-x-3 mt-3">
              {renderMotivationIcons()}
              {profile.is_love_hotel_member && (
                <Heart className="w-5 h-5 text-rose-500" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}