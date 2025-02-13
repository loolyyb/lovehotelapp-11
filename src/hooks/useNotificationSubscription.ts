
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertService } from '@/services/AlertService';

export function useNotificationSubscription() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        checkSubscription();
      }
    };
    
    checkAuth();
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

  const requestNotificationPermission = async (): Promise<boolean> => {
    // D'abord vérifier si l'utilisateur est connecté
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        variant: "destructive",
        title: "Non autorisé",
        description: "Vous devez être connecté pour gérer les notifications.",
      });
      return false;
    }

    // Vérifier si le navigateur supporte les notifications
    if (!('Notification' in window)) {
      toast({
        variant: "destructive",
        title: "Non supporté",
        description: "Votre navigateur ne supporte pas les notifications push.",
      });
      return false;
    }

    // Si la permission est déjà accordée
    if (Notification.permission === 'granted') {
      return true;
    }

    // Demander la permission AVANT de vérifier si elle est refusée
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        return true;
      } else if (permission === 'denied') {
        toast({
          variant: "destructive",
          title: "Notifications bloquées",
          description: "Vous devez autoriser les notifications dans les paramètres de votre navigateur.",
        });
        return false;
      } else {
        toast({
          variant: "destructive",
          title: "Permission refusée",
          description: "Vous devez autoriser les notifications pour recevoir les alertes.",
        });
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      AlertService.captureException(error as Error);
      return false;
    }
  };

  const subscribeToNotifications = async () => {
    try {
      // Vérifier la session avant tout
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Non autorisé",
          description: "Vous devez être connecté pour activer les notifications.",
        });
        return false;
      }

      // Vérifier et demander la permission
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        // Réinitialiser le switch si la permission est refusée
        setIsSubscribed(false);
        return false;
      }

      const registration = await navigator.serviceWorker.ready;      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
      });

      // Enregistrer l'inscription dans la base de données
      const { error } = await supabase.from('push_subscriptions').insert([{
        user_id: session.user.id,
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
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'inscription aux notifications:', error);
      AlertService.captureException(error as Error);
      setIsSubscribed(false); // Réinitialiser le switch en cas d'erreur
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription aux notifications.",
      });
      return false;
    }
  };

  const unsubscribeFromNotifications = async () => {
    try {
      // Vérifier la session avant tout
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Non autorisé",
          description: "Vous devez être connecté pour gérer les notifications.",
        });
        return;
      }

      if (!subscription) return;

      await subscription.unsubscribe();
      
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint);

      if (error) throw error;

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
