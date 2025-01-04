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

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
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

    try {
      // Check if a conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${currentUserId},user2_id.eq.${profileId}),and(user1_id.eq.${profileId},user2_id.eq.${currentUserId})`)
        .eq('status', 'active')
        .single();

      if (existingConversation) {
        navigate('/messages', { state: { conversationId: existingConversation.id } });
        return;
      }

      // Create new conversation
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert([
          {
            user1_id: currentUserId,
            user2_id: profileId,
            status: 'active'
          }
        ])
        .select()
        .single();

      if (conversationError) throw conversationError;

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