import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EventParticipationButtonProps {
  eventId: string;
  onSuccess?: () => void;
}

export function EventParticipationButton({ eventId, onSuccess }: EventParticipationButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleParticipate = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Vous devez être connecté pour participer");

      const { error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre participation a été enregistrée",
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error participating in event:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de votre participation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleParticipate} 
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? "En cours..." : "Participer"}
    </Button>
  );
}