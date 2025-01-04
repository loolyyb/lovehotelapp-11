import { Heart, MessageCircle, Blinds } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUserId, getTargetUserId, createOrGetConversation } from "@/utils/conversationUtils";
import { ProfileActionButton } from "./ProfileActionButton";

interface ProfileActionsProps {
  profileId: string;
}

export function ProfileActions({ profileId }: ProfileActionsProps) {
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

  const handleLike = () => {
    if (isTestProfile) {
      handleTestProfileError();
      return;
    }
    toast({
      title: "Coup de cœur envoyé !",
      description: "Cette personne sera notifiée de votre intérêt.",
    });
  };

  const handleCurtainRequest = () => {
    if (isTestProfile) {
      handleTestProfileError();
      return;
    }
    toast({
      title: "Demande envoyée !",
      description: "Votre intérêt pour un moment rideau ouvert a été enregistré.",
    });
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

  return (
    <div className="flex flex-wrap gap-4 justify-center mt-6">
      <TooltipProvider>
        <ProfileActionButton
          icon={Heart}
          label="Coup de cœur"
          onClick={handleLike}
          disabled={isTestProfile}
          tooltipText="Envoyer un coup de cœur"
          disabledTooltipText="Action non disponible sur un profil de test"
        />

        <ProfileActionButton
          icon={Blinds}
          label="Rideau ouvert"
          onClick={handleCurtainRequest}
          disabled={isTestProfile}
          variant="outline"
          tooltipText="Demander un moment rideau ouvert"
          disabledTooltipText="Action non disponible sur un profil de test"
        />

        <ProfileActionButton
          icon={MessageCircle}
          label="Message"
          onClick={handleMessage}
          disabled={isTestProfile}
          variant="outline"
          tooltipText="Envoyer un message"
          disabledTooltipText="Action non disponible sur un profil de test"
        />
      </TooltipProvider>
    </div>
  );
}