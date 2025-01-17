import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tables } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { ProfileInterestIcons } from "./ProfileInterestIcons";

interface ProfileCardProps {
  profile: Tables<"profiles">;
  preferences?: Tables<"preferences"> | null;
}

export function ProfileCard({ profile, preferences }: ProfileCardProps) {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/profile/${profile.id}`);
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

          <ProfileInterestIcons profile={profile} preferences={preferences} />
        </div>
      </CardContent>
    </Card>
  );
}