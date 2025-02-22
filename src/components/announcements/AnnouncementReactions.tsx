
import { Button } from "@/components/ui/button";
import { ThumbsUp, Heart } from "lucide-react";

interface AnnouncementReactionsProps {
  reactions: {
    reaction_type: string;
    count: number;
  }[];
  userReaction?: string;
  onReact: (type: string) => void;
  disabled: boolean;
}

export function AnnouncementReactions({ reactions, userReaction, onReact, disabled }: AnnouncementReactionsProps) {
  return (
    <div className="flex gap-2">
      <Button 
        variant="ghost" 
        size="sm" 
        className={`${userReaction === 'like' ? 'text-[#ce0067]' : 'text-gray-700'} hover:text-[#ce0067]`}
        disabled={disabled}
        onClick={() => onReact('like')}
      >
        <ThumbsUp className="w-4 h-4 mr-2" />
        <span>{reactions.find(r => r.reaction_type === 'like')?.count || 0}</span>
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className={`${userReaction === 'love' ? 'text-[#ce0067]' : 'text-gray-700'} hover:text-[#ce0067]`}
        disabled={disabled}
        onClick={() => onReact('love')}
      >
        <Heart className="w-4 h-4 mr-2" />
        <span>{reactions.find(r => r.reaction_type === 'love')?.count || 0}</span>
      </Button>
    </div>
  );
}
