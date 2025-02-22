
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { MessageSquare, ThumbsUp, Heart, Smile } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AnnouncementProps {
  announcement: {
    id: string;
    content: string;
    image_url: string | null;
    created_at: string;
    user_id: string;
    profiles: {
      full_name: string;
      avatar_url: string | null;
    } | null;
  };
}

export function Announcement({ announcement }: AnnouncementProps) {
  const { session } = useAuthSession();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [reactions, setReactions] = useState<{[key: string]: number}>({});
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const handleReaction = async (type: string) => {
    if (!session?.user) return;

    try {
      if (userReaction === type) {
        // Remove reaction
        await supabase
          .from('announcement_reactions')
          .delete()
          .eq('announcement_id', announcement.id)
          .eq('user_id', session.user.id);
        setUserReaction(null);
      } else {
        // Add or update reaction
        if (userReaction) {
          await supabase
            .from('announcement_reactions')
            .update({ reaction_type: type })
            .eq('announcement_id', announcement.id)
            .eq('user_id', session.user.id);
        } else {
          await supabase
            .from('announcement_reactions')
            .insert({
              announcement_id: announcement.id,
              user_id: session.user.id,
              reaction_type: type
            });
        }
        setUserReaction(type);
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de réagir à l'annonce",
      });
    }
  };

  const loadComments = async () => {
    if (!showComments) {
      setIsLoadingComments(true);
      try {
        const { data, error } = await supabase
          .from('announcement_comments')
          .select(`
            *,
            profiles (
              full_name,
              avatar_url
            )
          `)
          .eq('announcement_id', announcement.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setComments(data);
      } catch (error) {
        console.error('Error loading comments:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les commentaires",
        });
      } finally {
        setIsLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleComment = async () => {
    if (!session?.user || !newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('announcement_comments')
        .insert({
          announcement_id: announcement.id,
          user_id: session.user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment("");
      loadComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de publier le commentaire",
      });
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-burgundy/20 rounded-lg p-6 space-y-4">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-burgundy/20 flex items-center justify-center overflow-hidden">
          {announcement.profiles?.avatar_url ? (
            <img
              src={announcement.profiles.avatar_url}
              alt={announcement.profiles.full_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-burgundy">
              {announcement.profiles?.full_name?.[0] || '?'}
            </span>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-burgundy">
              {announcement.profiles?.full_name || 'Utilisateur inconnu'}
            </h3>
            <time className="text-sm text-gray-500">
              {format(new Date(announcement.created_at), 'PP à p', { locale: fr })}
            </time>
          </div>
          
          <p className="mt-2 text-gray-700">{announcement.content}</p>
          
          {announcement.image_url && (
            <img
              src={announcement.image_url}
              alt="Image de l'annonce"
              className="mt-4 rounded-lg max-h-96 object-cover w-full"
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-burgundy/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleReaction('like')}
          className={userReaction === 'like' ? 'text-burgundy' : ''}
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          J'aime
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleReaction('love')}
          className={userReaction === 'love' ? 'text-burgundy' : ''}
        >
          <Heart className="h-4 w-4 mr-2" />
          J'adore
        </Button>
        
        <Button variant="ghost" size="sm" onClick={loadComments}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Commenter
        </Button>
      </div>

      {showComments && (
        <div className="space-y-4 pt-4 border-t border-burgundy/10">
          {isLoadingComments ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-burgundy/5 rounded" />
              ))}
            </div>
          ) : (
            <>
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-burgundy/20 flex items-center justify-center">
                    {comment.profiles?.avatar_url ? (
                      <img
                        src={comment.profiles.avatar_url}
                        alt={comment.profiles.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-burgundy text-sm">
                        {comment.profiles?.full_name?.[0] || '?'}
                      </span>
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
                <Button onClick={handleComment}>
                  Envoyer
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
