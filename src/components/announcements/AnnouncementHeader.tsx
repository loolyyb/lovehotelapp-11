
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { AnnouncementActions } from "./AnnouncementActions";

interface AnnouncementHeaderProps {
  user: {
    full_name: string;
    avatar_url?: string;
  };
  createdAt: string;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function AnnouncementHeader({ user, createdAt, isOwner, onEdit, onDelete }: AnnouncementHeaderProps) {
  return (
    <div className="flex flex-row items-center gap-4 bg-white">
      <Avatar>
        <AvatarImage src={user.avatar_url} />
        <AvatarFallback>{user.full_name?.[0] || '?'}</AvatarFallback>
      </Avatar>
      <div className="flex flex-1 items-center justify-between">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{user.full_name}</span>
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
