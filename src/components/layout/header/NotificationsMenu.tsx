
import { useState, useEffect } from "react";
import { Bell, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Database } from "@/integrations/supabase/types/database.types";
import { useToast } from "@/hooks/use-toast";
import { useLogger } from "@/hooks/useLogger";

type Notification = Database['public']['Tables']['notifications']['Row'];

export function NotificationsMenu() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const { toast } = useToast();
  const logger = useLogger('NotificationsMenu');

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        fetchNotifications();
      } else if (event === 'SIGNED_OUT') {
        setNotifications([]);
        setUnreadCount(0);
      }
    });

    fetchNotifications();
    const cleanupSubscription = subscribeToNotifications();

    return () => {
      authListener?.subscription.unsubscribe();
      cleanupSubscription();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        logger.error('Erreur lors de la récupération des notifications:', { error });
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger vos notifications. Veuillez réessayer."
        });
        return;
      }

      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.is_read).length);
    } catch (error) {
      logger.error('Erreur dans fetchNotifications:', { error });
      toast({
        variant: "destructive",
        title: "Erreur inattendue",
        description: "Une erreur est survenue lors du chargement des notifications."
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          logger.info('Changement de notification détecté:', { payload });
          fetchNotifications();
        }
      )
      .subscribe((status) => {
        logger.info('Statut de la souscription aux notifications:', { status });
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    if (isMarkingAsRead) return;

    setIsMarkingAsRead(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        logger.error('Erreur lors du marquage de la notification:', { error });
        toast({
          variant: "destructive",
          title: "Erreur de mise à jour",
          description: "Impossible de marquer la notification comme lue."
        });
        return;
      }

      // Mise à jour locale optimiste
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      logger.error('Erreur dans markAsRead:', { error });
    } finally {
      setIsMarkingAsRead(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'offer':
        return '🎁';
      case 'news':
        return '📰';
      case 'event':
        return '🎉';
      case 'restaurant':
        return '🍽️';
      case 'love_room':
        return '🏨';
      default:
        return '📌';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-burgundy stroke-[1.5]" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-rose text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Chargement des notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Aucune notification
            </div>
          ) : (
            notifications.map((notification) => (
              <Link
                key={notification.id}
                to={notification.link_url || '#'}
                className={`block p-4 hover:bg-[#911e55]/20 transition-colors duration-200 border-b last:border-b-0 ${
                  !notification.is_read ? 'bg-rose/5' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <p className="text-sm text-gray-300 mt-1">
                      {notification.content}
                    </p>
                    <span className="text-xs text-gray-400 mt-2 block">
                      {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
