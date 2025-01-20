import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { getCurrentUserId, getTargetUserId, createOrGetConversation } from "@/utils/conversationUtils";
import { supabase } from "@/integrations/supabase/client";

type NotificationType = 'like' | 'curtain_request' | 'message' | 'offer' | 'news' | 'event' | 'restaurant' | 'love_room';

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
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No active session");
        return;
      }

      setCurrentUserId(session.user.id);

      // Get target profile info
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('id', profileId)
        .single();

      if (!targetProfile?.user_id) {
        console.log("Test profile detected");
        setIsTestProfile(true);
        return;
      }

      setTargetUserId(targetProfile.user_id);
    } catch (error) {
      console.error("Error loading user IDs:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les informations du profil.",
      });
    }
  };

  const createNotification = async (
    userId: string,
    type: NotificationType,
    title: string,
    content: string,
    imageUrl?: string
  ) => {
    try {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          content,
          image_url: imageUrl,
          link_url: `/profile/${profileId}`
        });

      if (notificationError) throw notificationError;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
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
      // Get sender profile info
      const { data: senderProfile, error: profileError } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('user_id', currentUserId)
        .single();

      if (profileError) throw profileError;

      await createNotification(
        targetUserId,
        'like',
        'Nouveau coup de cœur',
        `${senderProfile.full_name || senderProfile.username} vous a envoyé un coup de cœur !`,
        senderProfile.avatar_url
      );

      toast({
        title: "Coup de cœur envoyé !",
        description: "Cette personne sera notifiée de votre intérêt.",
      });
    } catch (error) {
      console.error('Error sending like:', error);
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
      // Get sender profile info
      const { data: senderProfile, error: profileError } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('user_id', currentUserId)
        .single();

      if (profileError) throw profileError;

      await createNotification(
        targetUserId,
        'curtain_request',
        'Demande de rideau ouvert',
        `${senderProfile.full_name || senderProfile.username} souhaite un moment rideau ouvert avec vous`,
        senderProfile.avatar_url
      );

      toast({
        title: "Demande envoyée !",
        description: "Votre intérêt pour un moment rideau ouvert a été enregistré.",
      });
    } catch (error) {
      console.error('Error sending curtain request:', error);
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

    try {
      const { id: conversationId, isNew } = await createOrGetConversation(currentUserId, profileId);
      
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