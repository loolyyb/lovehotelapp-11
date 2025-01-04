import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Blinds } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface ProfileActionsProps {
  profileId: string;
}

export function ProfileActions({ profileId }: ProfileActionsProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
    getTargetUserId();
  }, [profileId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const getTargetUserId = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', profileId)
      .maybeSingle();
    
    setTargetUserId(profile?.user_id || null);
  };

  const handleLike = () => {
    toast({
      title: "Coup de cœur envoyé !",
      description: "Cette personne sera notifiée de votre intérêt.",
    });
  };

  const handleCurtainRequest = () => {
    toast({
      title: "Demande envoyée !",
      description: "Votre intérêt pour un moment rideau ouvert a été enregistré.",
    });
  };

  const handleMessage = async () => {
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
      // Check if a conversation already exists
      const { data: existingConversations, error: queryError } = await supabase
        .from('conversations')
        .select('id')
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
        .or(`user1_id.eq.${targetUserId},user2_id.eq.${targetUserId}`)
        .eq('status', 'active');

      if (queryError) throw queryError;

      const existingConversation = existingConversations?.find(
        conv => (conv.user1_id === currentUserId && conv.user2_id === targetUserId) ||
               (conv.user1_id === targetUserId && conv.user2_id === currentUserId)
      );

      if (existingConversation) {
        navigate('/messages', { state: { conversationId: existingConversation.id } });
        return;
      }

      // Create new conversation
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          user1_id: currentUserId,
          user2_id: targetUserId,
          status: 'active'
        })
        .select()
        .maybeSingle();

      if (conversationError) throw conversationError;
      if (!newConversation) throw new Error("Failed to create conversation");

      toast({
        title: "Conversation créée",
        description: "Vous pouvez maintenant envoyer un message.",
      });

      // Navigate to messages with the new conversation selected
      navigate('/messages', { state: { conversationId: newConversation.id } });

    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer la conversation.",
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center mt-6">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleLike}
              className="bg-burgundy hover:bg-burgundy/90"
            >
              <Heart className="mr-2 h-5 w-5" />
              Coup de cœur
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Envoyer un coup de cœur</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleCurtainRequest}
              variant="outline"
              className="border-burgundy text-burgundy hover:bg-burgundy/10"
            >
              <Blinds className="mr-2 h-5 w-5" />
              Rideau ouvert
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Demander un moment rideau ouvert</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleMessage}
              variant="outline"
              className="border-burgundy text-burgundy hover:bg-burgundy/10"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Message
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Envoyer un message</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}