
import { Button } from "@/components/ui/button";
import { ThumbsUp, Heart, MessageSquare, Loader2 } from "lucide-react";

interface AnnouncementReactionsProps {
  reactions: { [key: string]: number };
  userReaction: string | null;
  commentsCount: number;
  onReaction: (type: string) => void;
  onCommentClick: () => void;
  isSubmitting?: boolean;
}

export function AnnouncementReactions({
  reactions,
  userReaction,
  commentsCount,
  onReaction,
  onCommentClick,
  isSubmitting = false
}: AnnouncementReactionsProps) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-burgundy/10">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReaction('like')}
          className={`${userReaction === 'like' ? 'text-burgundy bg-burgundy/10' : ''} gap-2 relative transition-all duration-200 hover:bg-burgundy/5`}
          disabled={isSubmitting}
        >
          {isSubmitting && userReaction === 'like' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ThumbsUp className={`h-4 w-4 transition-transform duration-200 ${
              userReaction === 'like' ? 'scale-125' : ''
            }`} />
          )}
          <span>J'aime {reactions['like'] ? `(${reactions['like']})` : ''}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReaction('love')}
          className={`${userReaction === 'love' ? 'text-burgundy bg-burgundy/10' : ''} gap-2 relative transition-all duration-200 hover:bg-burgundy/5`}
          disabled={isSubmitting}
        >
          {isSubmitting && userReaction === 'love' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={`h-4 w-4 transition-transform duration-200 ${
              userReaction === 'love' ? 'scale-125' : ''
            }`} />
          )}
          <span>J'adore {reactions['love'] ? `(${reactions['love']})` : ''}</span>
        </Button>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onCommentClick} 
        className="gap-2 hover:bg-burgundy/5"
      >
        <MessageSquare className="h-4 w-4" />
        <span>Commenter {commentsCount > 0 ? `(${commentsCount})` : ''}</span>
      </Button>
    </div>
  );
}
