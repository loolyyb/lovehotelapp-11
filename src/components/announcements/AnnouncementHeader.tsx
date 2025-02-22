
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { AnnouncementActions } from "./AnnouncementActions";
import { User2 } from "lucide-react";

interface AnnouncementHeaderProps {
  userId: string;
  createdAt: string;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function AnnouncementHeader({ userId, createdAt, isOwner, onEdit, onDelete }: AnnouncementHeaderProps) {
  return (
    <div className="flex flex-row items-center gap-4 bg-white">
      <Avatar>
        <AvatarFallback>
          <User2 className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-1 items-center justify-between">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">Utilisateur {userId.slice(0, 6)}</span>
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
