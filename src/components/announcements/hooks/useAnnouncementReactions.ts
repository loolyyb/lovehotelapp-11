
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export function useAnnouncementReactions(announcementId: string, session: Session | null) {
  const [reactions, setReactions] = useState<{[key: string]: number}>({});
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (announcementId) {
      fetchReactions();
      fetchUserReaction();
    }
  }, [announcementId]);

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('announcement_reactions')
        .select('reaction_type')
        .eq('announcement_id', announcementId);

      if (error) throw error;

      const reactionCounts = data.reduce((acc: {[key: string]: number}, reaction) => {
        acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
        return acc;
      }, {});

      setReactions(reactionCounts);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const fetchUserReaction = async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('announcement_reactions')
        .select('reaction_type')
        .eq('announcement_id', announcementId)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      setUserReaction(data?.reaction_type || null);
    } catch (error) {
      console.error('Error fetching user reaction:', error);
    }
  };

  const handleReaction = async (type: string) => {
    if (!session?.user) return;

    try {
      if (userReaction === type) {
        await supabase
          .from('announcement_reactions')
          .delete()
          .eq('announcement_id', announcementId)
          .eq('user_id', session.user.id);
        setUserReaction(null);
      } else {
        if (userReaction) {
          await supabase
            .from('announcement_reactions')
            .update({ reaction_type: type })
            .eq('announcement_id', announcementId)
            .eq('user_id', session.user.id);
        } else {
          await supabase
            .from('announcement_reactions')
            .insert({
              announcement_id: announcementId,
              user_id: session.user.id,
              reaction_type: type
            });
        }
        setUserReaction(type);
      }
      fetchReactions();
    } catch (error) {
      console.error('Error handling reaction:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de réagir à l'annonce",
      });
    }
  };

  return { reactions, userReaction, handleReaction };
}
