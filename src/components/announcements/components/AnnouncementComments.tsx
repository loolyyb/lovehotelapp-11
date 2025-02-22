
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";

interface AnnouncementCommentsProps {
  comments: any[];
  isLoading: boolean;
  onSubmitComment: (comment: string) => void;
}

export function AnnouncementComments({
  comments,
  isLoading,
  onSubmitComment
}: AnnouncementCommentsProps) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    onSubmitComment(newComment);
    setNewComment("");
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-burgundy/5 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex items-start gap-4">
          <div className="h-8 w-8 rounded-full bg-burgundy/20 flex items-center justify-center overflow-hidden">
            {comment.profiles?.avatar_url ? (
              <img
                src={comment.profiles.avatar_url}
                alt={comment.profiles.full_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-burgundy" />
            )}
          </div>
          <div className="flex-1 bg-burgundy/5 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">
                {comment.profiles?.full_name || 'Utilisateur inconnu'}
              </span>
              <time className="text-xs text-gray-500">
                {format(new Date(comment.created_at), 'PP à p', { locale: fr })}
              </time>
            </div>
            <p className="mt-1 text-sm">{comment.content}</p>
          </div>
        </div>
      ))}
      
      <div className="flex items-start gap-4 pt-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Écrire un commentaire..."
          className="flex-1"
        />
        <Button onClick={handleSubmit}>
          Envoyer
        </Button>
      </div>
    </div>
  );
}
