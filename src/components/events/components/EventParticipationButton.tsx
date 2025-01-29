import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface EventParticipationButtonProps {
  eventId: string;
  onSuccess?: () => void;
}

export function EventParticipationButton({ eventId, onSuccess }: EventParticipationButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: participation, isLoading: checkingParticipation } = useQuery({
    queryKey: ['event-participation', eventId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  const participateMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Vous devez être connecté pour participer");

      const { error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-participation', eventId] });
      toast({
        title: "Succès",
        description: "Votre participation a été enregistrée",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error('Error participating in event:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de votre participation",
        variant: "destructive",
      });
    }
  });

  const cancelParticipationMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Vous devez être connecté");

      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-participation', eventId] });
      toast({
        title: "Succès",
        description: "Votre participation a été annulée",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error('Error canceling participation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'annulation de votre participation",
        variant: "destructive",
      });
    }
  });

  if (checkingParticipation) {
    return (
      <Button disabled className="w-full">
        Chargement...
      </Button>
    );
  }

  if (participation) {
    return (
      <Button 
        onClick={() => cancelParticipationMutation.mutate()} 
        variant="destructive"
        disabled={cancelParticipationMutation.isPending}
        className="w-full"
      >
        {cancelParticipationMutation.isPending ? "Annulation..." : "Annuler ma participation"}
      </Button>
    );
  }

  return (
    <Button 
      onClick={() => participateMutation.mutate()} 
      disabled={participateMutation.isPending}
      className="w-full"
    >
      {participateMutation.isPending ? "En cours..." : "Participer"}
    </Button>
  );
}