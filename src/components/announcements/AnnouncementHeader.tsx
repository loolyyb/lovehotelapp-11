
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { AnnouncementActions } from "./AnnouncementActions";
import { User2 } from "lucide-react";
import { AnnouncementUser } from "@/types/announcements.types";

interface AnnouncementHeaderProps {
  user: AnnouncementUser;
  createdAt: string;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function AnnouncementHeader({ user, createdAt, isOwner, onEdit, onDelete }: AnnouncementHeaderProps) {
  const displayName = user.username || user.full_name || `Utilisateur ${user.id.slice(0, 6)}`;

  return (
    <div className="flex flex-row items-center gap-4 bg-white">
      <Avatar>
        {user.avatar_url ? (
          <AvatarImage src={user.avatar_url} alt={displayName} className="object-cover" />
        ) : (
          <AvatarFallback>
            <User2 className="w-4 h-4" />
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex flex-1 items-center justify-between">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{displayName}</span>
          <span className="text-sm text-gray-600">
            {formatDistanceToNow(new Date(createdAt), {
              addSuffix: true,
              locale: fr
            })}
          </span>
        </div>
        {isOwner && <AnnouncementActions onEdit={onEdit} onDelete={onDelete} />}
      </div>
    </div>
  );
}
