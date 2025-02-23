
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export function useAnnouncementComments(announcementId: string, session: Session | null) {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const { toast } = useToast();

  const fetchCommentCount = async () => {
    try {
      const { count, error } = await supabase
        .from('announcement_comments')
        .select('*', { count: 'exact', head: true })
        .eq('announcement_id', announcementId);

      if (error) throw error;
      setCommentCount(count || 0);
    } catch (error) {
      console.error('Error fetching comment count:', error);
    }
  };

  useEffect(() => {
    fetchCommentCount();
  }, [announcementId]);

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
          .eq('announcement_id', announcementId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setComments(data || []);
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

  const handleComment = async (newComment: string) => {
    if (!session?.user || !newComment.trim()) return;

    try {
      const { data, error } = await supabase
        .from('announcement_comments')
        .insert({
          announcement_id: announcementId,
          user_id: session.user.id,
          content: newComment.trim()
        })
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Ajouter immédiatement le nouveau commentaire à la liste
      if (data) {
        setComments(prevComments => [...prevComments, data]);
        setCommentCount(prevCount => prevCount + 1);
      }

      toast({
        title: "Commentaire publié",
        description: "Votre commentaire a été ajouté avec succès"
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de publier le commentaire",
      });
    }
  };

  return {
    comments,
    isLoadingComments,
    showComments,
    loadComments,
    handleComment,
    commentCount
  };
}
