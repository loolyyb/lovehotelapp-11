import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

interface ProfileHeaderProps {
  avatarUrl?: string | null;
  fullName?: string | null;
  bio?: string | null;
}

export function ProfileHeader({ avatarUrl, fullName, bio }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative w-48 h-48 md:w-64 md:h-64">
        <img
          src={avatarUrl ?? "/placeholder.svg"}
          alt={fullName ?? "Profile"}
          className="w-full h-full object-cover rounded-full border-4 border-rose shadow-lg"
        />
      </div>

      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-burgundy">
          {fullName || 'Anonyme'}
        </h1>
        {bio && (
          <p className="text-gray-600 max-w-2xl text-lg">{bio}</p>
        )}
      </div>
    </div>
  );
}