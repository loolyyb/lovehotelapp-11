import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { getCurrentUserId, getTargetUserId, createOrGetConversation } from "@/utils/conversationUtils";
import { supabase } from "@/integrations/supabase/client";

export function useProfileActions(profileId: string) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [isTestProfile, setIsTestProfile] = useState(false);

  useEffect(() => {
    loadUserIds();
  }, [profileId]);

  const loadUserIds = async () => {
    const current = await getCurrentUserId();
    setCurrentUserId(current);
    
    const target = await getTargetUserId(profileId);
    if (!target) {
      setIsTestProfile(true);
    }
    setTargetUserId(target);
  };

  const handleTestProfileError = () => {
    toast({
      variant: "destructive",
      title: "Profil de test",
      description: "Vous ne pouvez pas interagir avec un profil de test.",
    });
  };

  const handleLike = async () => {
    if (isTestProfile) {
      handleTestProfileError();
      return;
    }

    if (!currentUserId || !targetUserId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du coup de cœur.",
      });
      return;
    }

    try {
      // Récupérer les informations du profil qui envoie le coup de cœur
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('user_id', currentUserId)
        .single();

      if (!senderProfile) {
        throw new Error("Profil de l'expéditeur non trouvé");
      }

      // Créer la notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          type: 'like',
          title: 'Nouveau coup de cœur',
          content: `${senderProfile.full_name || senderProfile.username} vous a envoyé un coup de cœur !`,
          image_url: senderProfile.avatar_url,
          link_url: `/profile/${profileId}`
        });

      if (notificationError) {
        throw notificationError;
      }

      toast({
        title: "Coup de cœur envoyé !",
        description: "Cette personne sera notifiée de votre intérêt.",
      });
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le coup de cœur.",
      });
    }
  };

  const handleCurtainRequest = async () => {
    if (isTestProfile) {
      handleTestProfileError();
      return;
    }

    if (!currentUserId || !targetUserId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la demande.",
      });
      return;
    }

    try {
      // Récupérer les informations du profil qui fait la demande
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('user_id', currentUserId)
        .single();

      if (!senderProfile) {
        throw new Error("Profil de l'expéditeur non trouvé");
      }

      // Créer la notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          type: 'curtain_request',
          title: 'Demande de rideau ouvert',
          content: `${senderProfile.full_name || senderProfile.username} souhaite un moment rideau ouvert avec vous`,
          image_url: senderProfile.avatar_url,
          link_url: `/profile/${profileId}`
        });

      if (notificationError) {
        throw notificationError;
      }

      toast({
        title: "Demande envoyée !",
        description: "Votre intérêt pour un moment rideau ouvert a été enregistré.",
      });
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer la demande de rideau ouvert.",
      });
    }
  };

  const handleMessage = async () => {
    if (isTestProfile) {
      handleTestProfileError();
      return;
    }

    if (!currentUserId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour envoyer un message.",
      });
      return;
    }

    if (!targetUserId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de trouver l'utilisateur cible.",
      });
      return;
    }

    try {
      const { id: conversationId, isNew } = await createOrGetConversation(currentUserId, targetUserId);
      
      if (isNew) {
        toast({
          title: "Conversation créée",
          description: "Vous pouvez maintenant envoyer un message.",
        });
      }

      navigate('/messages', { state: { conversationId } });
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer la conversation.",
      });
    }
  };

  return {
    isTestProfile,
    handleLike,
    handleCurtainRequest,
    handleMessage
  };
}