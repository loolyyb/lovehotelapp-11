
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertService } from '@/services/AlertService';

export function useNotificationSubscription() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      setSubscription(existingSubscription);
      setIsSubscribed(!!existingSubscription);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'inscription:', error);
      AlertService.captureException(error as Error);
    }
  };

  const subscribeToNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;

      // S'assurer que les notifications sont autorisées
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Les notifications doivent être autorisées pour recevoir les notifications push.",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous devez être connecté pour recevoir les notifications.",
        });
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
      });

      // Enregistrer l'inscription dans la base de données
      const { error } = await supabase.from('push_subscriptions').insert([{
        user_id: user.id,
        endpoint: subscription.endpoint,
        auth: subscription.toJSON().keys?.auth,
        p256dh: subscription.toJSON().keys?.p256dh
      }]);

      if (error) throw error;

      setSubscription(subscription);
      setIsSubscribed(true);

      toast({
        title: "Succès",
        description: "Vous êtes maintenant inscrit aux notifications push.",
      });
    } catch (error) {
      console.error('Erreur lors de l\'inscription aux notifications:', error);
      AlertService.captureException(error as Error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription aux notifications.",
      });
    }
  };

  const unsubscribeFromNotifications = async () => {
    try {
      if (!subscription) return;

      await subscription.unsubscribe();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint);

        if (error) throw error;
      }

      setSubscription(null);
      setIsSubscribed(false);

      toast({
        title: "Succès",
        description: "Vous êtes maintenant désinscrit des notifications push.",
      });
    } catch (error) {
      console.error('Erreur lors de la désinscription:', error);
      AlertService.captureException(error as Error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la désinscription.",
      });
    }
  };

  return {
    isSubscribed,
    subscribeToNotifications,
    unsubscribeFromNotifications
  };
}
