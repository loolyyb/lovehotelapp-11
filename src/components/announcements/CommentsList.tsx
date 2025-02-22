
import { AnnouncementComment } from "@/types/announcements.types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { User2 } from "lucide-react";

interface CommentsListProps {
  comments: AnnouncementComment[];
}

export function CommentsList({ comments }: CommentsListProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback>
              <User2 className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="font-medium text-sm">Utilisateur {comment.user_id.slice(0, 6)}</p>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: fr
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
