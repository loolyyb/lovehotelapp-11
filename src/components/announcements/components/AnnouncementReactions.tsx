
import { Button } from "@/components/ui/button";
import { ThumbsUp, Heart, MessageSquare } from "lucide-react";

interface AnnouncementReactionsProps {
  reactions: { [key: string]: number };
  userReaction: string | null;
  commentsCount: number;
  onReaction: (type: string) => void;
  onCommentClick: () => void;
}

export function AnnouncementReactions({
  reactions,
  userReaction,
  commentsCount,
  onReaction,
  onCommentClick
}: AnnouncementReactionsProps) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-burgundy/10">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReaction('like')}
          className={`${userReaction === 'like' ? 'text-burgundy' : ''} gap-2`}
        >
          <ThumbsUp className="h-4 w-4" />
          <span>J'aime {reactions['like'] ? `(${reactions['like']})` : ''}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReaction('love')}
          className={`${userReaction === 'love' ? 'text-burgundy' : ''} gap-2`}
        >
          <Heart className="h-4 w-4" />
          <span>J'adore {reactions['love'] ? `(${reactions['love']})` : ''}</span>
        </Button>
      </div>
      
      <Button variant="ghost" size="sm" onClick={onCommentClick} className="gap-2">
        <MessageSquare className="h-4 w-4" />
        <span>Commenter {commentsCount > 0 ? `(${commentsCount})` : ''}</span>
      </Button>
    </div>
  );
}
