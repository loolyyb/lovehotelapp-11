import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Heart, Blinds } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProfileCardProps {
  profile: Tables<"profiles">;
  preferences?: Tables<"preferences"> | null;
}

export function ProfileCard({ profile, preferences }: ProfileCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fadeIn bg-white/80 backdrop-blur-sm">
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

            {preferences?.location && (
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{preferences.location}</span>
              </div>
            )}

            {profile.bio && (
              <p className="text-gray-600 line-clamp-2 text-sm">
                {profile.bio}
              </p>
            )}

            {preferences?.interests && preferences.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {preferences.interests.slice(0, 3).map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-rose/20 text-burgundy rounded-full text-xs"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-center space-x-3 mt-3">
              {profile.is_love_hotel_member && (
                <Heart className="w-5 h-5 text-rose" />
              )}
              {profile.is_loolyb_holder && (
                <div className="w-5 h-5 rounded-full bg-burgundy" />
              )}
              {preferences?.open_curtains && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Blinds className="w-5 h-5 text-burgundy" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Rideaux ouverts</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}