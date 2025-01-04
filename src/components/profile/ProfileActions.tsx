import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Blinds } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

export function ProfileActions() {
  const { toast } = useToast();

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

  const handleMessage = () => {
    toast({
      title: "Bientôt disponible",
      description: "La messagerie sera disponible prochainement.",
    });
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