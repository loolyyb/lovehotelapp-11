
import { User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AnnouncementHeaderProps {
  full_name: string | null;
  avatar_url: string | null;
  createdAt: string;
}

export function AnnouncementHeader({ full_name, avatar_url, createdAt }: AnnouncementHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatar_url || ''} alt={full_name || 'Utilisateur'} />
          <AvatarFallback>
            <User className="h-5 w-5 text-burgundy" />
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-burgundy">
          {full_name || 'Utilisateur inconnu'}
        </h3>
      </div>
      <time className="text-sm text-gray-500">
        {format(new Date(createdAt), 'PP à p', { locale: fr })}
      </time>
    </div>
  );
}
