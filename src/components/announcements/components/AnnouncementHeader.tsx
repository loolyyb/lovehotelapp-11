
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { UserInfo } from "./UserInfo";

interface AnnouncementHeaderProps {
  full_name: string | null;
  avatar_url: string | null;
  createdAt: string;
}

export function AnnouncementHeader({
  full_name,
  avatar_url,
  createdAt
}: AnnouncementHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <UserInfo 
        full_name={full_name}
        avatar_url={avatar_url}
      />
      <time className="text-sm text-gray-500">
        {format(new Date(createdAt), 'PP à p', {
          locale: fr
        })}
      </time>
    </div>
  );
}
