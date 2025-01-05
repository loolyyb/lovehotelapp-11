import { Heart, MessageCircle, Blinds } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useProfileActions } from "@/hooks/useProfileActions";
import { ProfileActionButton } from "./ProfileActionButton";

interface ProfileActionsProps {
  profileId: string;
}

export function ProfileActions({ profileId }: ProfileActionsProps) {
  const { isTestProfile, handleLike, handleCurtainRequest, handleMessage } = useProfileActions(profileId);

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