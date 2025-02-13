
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

const DEFAULT_AVATAR_URL = "https://lovehotelapp.com/wp-content/uploads/2025/02/avatar-love-hotel.jpg";

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
      className={`${isMobile ? 'h-[300px]' : 'h-[400px]'} overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fadeIn bg-white/20 backdrop-blur-sm cursor-pointer transform hover:scale-105 transition-all`}
      onClick={handleProfileClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleProfileClick();
        }
      }}
    >
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex flex-col items-center space-y-4 flex-grow">
          <Avatar className={`${isMobile ? 'w-24 h-24' : 'w-32 h-32'} border-4 border-white shadow-lg`}>
            <AvatarImage 
              src={profile.avatar_url || DEFAULT_AVATAR_URL} 
              alt={profile.full_name ?? "Profile"} 
              className="object-cover"
            />
            <AvatarFallback>
              <img
                src={DEFAULT_AVATAR_URL}
                alt="Default Avatar"
                className="w-full h-full object-cover"
              />
            </AvatarFallback>
          </Avatar>

          <div className="text-center space-y-2 flex-grow">
            <h3 className="text-xl font-semibold text-gray-100">
              {profile.full_name}
            </h3>

            {preferences?.location && !isMobile && (
              <div className="flex items-center justify-center space-x-2 text-gray-200">
                <MapPin className="w-4 h-4" />
                <span>{preferences.location}</span>
              </div>
            )}

            {profile.bio && !isMobile && (
              <p className="text-gray-200 line-clamp-2 text-sm">
                {profile.bio}
              </p>
            )}

            <div className="flex items-center justify-center space-x-3 mt-auto">
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
