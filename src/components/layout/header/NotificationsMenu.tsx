import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
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

type Notification = Database['public']['Tables']['notifications']['Row'];

export function NotificationsMenu() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
    subscribeToNotifications();

    return () => {
      authListener?.subscription.unsubscribe();
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
        console.error('Error fetching notifications:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les notifications.",
        });
        return;
      }

      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des notifications.",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de marquer la notification comme lue.",
        });
      }
    } catch (error) {
      console.error('Error in markAsRead:', error);
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
            <div className="p-4 text-center text-gray-500">
              Chargement...
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
                className={`block p-4 hover:bg-gray-50 border-b last:border-b-0 ${
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
                    <p className="text-sm text-gray-600 mt-1">
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