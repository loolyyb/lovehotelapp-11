import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

interface ProfileHeaderProps {
  avatarUrl?: string | null;
  fullName?: string | null;
  bio?: string | null;
}

export function ProfileHeader({ avatarUrl, fullName, bio }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center space-y-6 relative">
      <div className="relative group">
        <Avatar className="w-40 h-40 border-4 border-rose shadow-lg transition-transform duration-300 group-hover:scale-105">
          <AvatarImage 
            src={avatarUrl ?? undefined} 
            alt={fullName ?? "Profile"}
            className="object-cover"
          />
          <AvatarFallback className="text-4xl bg-burgundy text-white">
            {fullName?.charAt(0) ?? "?"}
          </AvatarFallback>
        </Avatar>
        <button className="absolute bottom-2 right-2 bg-burgundy p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 shadow-lg">
          <Camera className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-burgundy">{fullName || 'Anonyme'}</h1>
        {bio && <p className="text-gray-600 max-w-md text-lg">{bio}</p>}
      </div>
    </div>
  );
}