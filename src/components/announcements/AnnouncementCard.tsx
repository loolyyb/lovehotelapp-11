
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, ThumbsUp, Heart, Party } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface AnnouncementCardProps {
  announcement: {
    id: string;
    content: string;
    image_url?: string;
    created_at: string;
    user: {
      full_name: string;
      avatar_url?: string;
    };
  };
  onReact: (type: string) => void;
  onComment: () => void;
  reactions: {
    type: string;
    count: number;
  }[];
  commentCount: number;
  userReaction?: string;
}

export function AnnouncementCard({
  announcement,
  onReact,
  onComment,
  reactions,
  commentCount,
  userReaction
}: AnnouncementCardProps) {
  return (
    <Card className="w-full bg-white shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={announcement.user.avatar_url} />
          <AvatarFallback>{announcement.user.full_name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold">{announcement.user.full_name}</span>
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true, locale: fr })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700">{announcement.content}</p>
        {announcement.image_url && (
          <img 
            src={announcement.image_url} 
            alt="Contenu de l'annonce" 
            className="rounded-lg max-h-96 w-full object-cover"
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={userReaction === 'like' ? 'text-[#ce0067]' : ''}
            onClick={() => onReact('like')}
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            <span>{reactions.find(r => r.type === 'like')?.count || 0}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={userReaction === 'love' ? 'text-[#ce0067]' : ''}
            onClick={() => onReact('love')}
          >
            <Heart className="w-4 h-4 mr-2" />
            <span>{reactions.find(r => r.type === 'love')?.count || 0}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={userReaction === 'party' ? 'text-[#ce0067]' : ''}
            onClick={() => onReact('party')}
          >
            <Party className="w-4 h-4 mr-2" />
            <span>{reactions.find(r => r.type === 'party')?.count || 0}</span>
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={onComment}>
          <MessageCircle className="w-4 h-4 mr-2" />
          <span>{commentCount}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
