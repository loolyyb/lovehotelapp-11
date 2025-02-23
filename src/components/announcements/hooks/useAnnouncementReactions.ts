
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useLogger } from "@/hooks/useLogger";

export function useAnnouncementReactions(announcementId: string, session: Session | null) {
  const [reactions, setReactions] = useState<{[key: string]: number}>({});
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const logger = useLogger('useAnnouncementReactions');

  useEffect(() => {
    if (announcementId) {
      fetchReactions();
      if (session?.user) {
        fetchUserReaction();
      }
    }
  }, [announcementId, session?.user?.id]);

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('announcement_reactions')
        .select('reaction_type')
        .eq('announcement_id', announcementId);

      if (error) {
        logger.error('Erreur lors de la récupération des réactions:', { error });
        throw error;
      }

      const reactionCounts = data.reduce((acc: {[key: string]: number}, reaction) => {
        acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
        return acc;
      }, {});

      setReactions(reactionCounts);
    } catch (error) {
      logger.error('Erreur lors du calcul des réactions:', { error });
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description: "Impossible de charger les réactions. Veuillez réessayer."
      });
    } finally {
      setIsLoading(false);
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

      if (error) {
        logger.error('Erreur lors de la récupération de la réaction utilisateur:', { error });
        throw error;
      }
      
      setUserReaction(data?.reaction_type || null);
    } catch (error) {
      logger.error('Erreur lors du traitement de la réaction utilisateur:', { error });
      toast({
        variant: "destructive",
        title: "Erreur de synchronisation",
        description: "Impossible de récupérer votre réaction. Veuillez réessayer."
      });
    }
  };

  const handleReaction = async (type: string) => {
    if (!session?.user) {
      toast({
        variant: "destructive",
        title: "Action non autorisée",
        description: "Vous devez être connecté pour réagir aux annonces."
      });
      return;
    }

    if (isSubmitting) {
      return; // Éviter les soumissions multiples
    }

    setIsSubmitting(true);

    try {
      if (userReaction === type) {
        // Suppression de la réaction
        const { error } = await supabase
          .from('announcement_reactions')
          .delete()
          .eq('announcement_id', announcementId)
          .eq('user_id', session.user.id);

        if (error) throw error;
        setUserReaction(null);
        toast({
          title: "Réaction supprimée",
          description: "Votre réaction a été retirée avec succès."
        });
      } else {
        // Mise à jour ou ajout de la réaction
        if (userReaction) {
          const { error } = await supabase
            .from('announcement_reactions')
            .update({ reaction_type: type })
            .eq('announcement_id', announcementId)
            .eq('user_id', session.user.id);

          if (error) throw error;
          toast({
            title: "Réaction modifiée",
            description: "Votre réaction a été mise à jour avec succès."
          });
        } else {
          const { error } = await supabase
            .from('announcement_reactions')
            .insert({
              announcement_id: announcementId,
              user_id: session.user.id,
              reaction_type: type
            });

          if (error) throw error;
          toast({
            title: "Réaction ajoutée",
            description: "Votre réaction a été enregistrée avec succès."
          });
        }
        setUserReaction(type);
      }
      // Rafraîchir les réactions après la modification
      await fetchReactions();
    } catch (error) {
      logger.error('Erreur lors de la gestion de la réaction:', { error });
      toast({
        variant: "destructive",
        title: "Erreur de traitement",
        description: "Impossible de gérer votre réaction. Veuillez réessayer."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    reactions, 
    userReaction, 
    handleReaction,
    isLoading,
    isSubmitting
  };
}
