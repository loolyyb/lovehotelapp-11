
import { User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AnnouncementHeaderProps {
  profileName: string;
  avatarUrl: string | null;
  createdAt: string;
}

export function AnnouncementHeader({ profileName, avatarUrl, createdAt }: AnnouncementHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl || ''} alt={profileName} />
          <AvatarFallback>
            <User className="h-5 w-5 text-burgundy" />
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-burgundy">
          {profileName || 'Utilisateur inconnu'}
        </h3>
      </div>
      <time className="text-sm text-gray-500">
        {format(new Date(createdAt), 'PP à p', { locale: fr })}
      </time>
    </div>
  );
}
