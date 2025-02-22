
import { User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AnnouncementHeaderProps {
  profileName: string;
  avatarUrl: string | null;
  createdAt: string;
}

export function AnnouncementHeader({ profileName, avatarUrl, createdAt }: AnnouncementHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-burgundy/20 flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={profileName}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-5 w-5 text-burgundy" />
          )}
        </div>
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
