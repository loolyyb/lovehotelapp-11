import { Heart, Star, Award, Blinds } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tables } from "@/integrations/supabase/types";

interface ProfileInterestIconsProps {
  profile: Tables<"profiles">;
  preferences?: Tables<"preferences"> | null;
}

export function ProfileInterestIcons({ profile, preferences }: ProfileInterestIconsProps) {
  // Add console logs to help debug the preferences data
  console.log("Profile:", profile.full_name, "Preferences:", preferences);
  console.log("Open curtains value:", preferences?.open_curtains);
  console.log("Open curtains interest value:", preferences?.open_curtains_interest);

  return (
    <div className="flex items-center justify-center space-x-3">
      {(preferences?.open_curtains || preferences?.open_curtains_interest) && (
        <TooltipProvider key="curtains">
          <Tooltip>
            <TooltipTrigger>
              <Blinds className="w-5 h-5 text-rose-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Rideaux ouverts</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {preferences?.libertine_party_interest && (
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
      )}
      
      {preferences?.speed_dating_interest && (
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
      )}

      {profile.is_love_hotel_member && (
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
      )}
    </div>
  );
}