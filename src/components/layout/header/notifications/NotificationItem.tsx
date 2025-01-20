import { Link } from "react-router-dom";
import { Database } from "@/integrations/supabase/types/database.types";

type Notification = Database['public']['Tables']['notifications']['Row'];

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

export const NotificationItem = ({ notification, onRead }: NotificationItemProps) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'curtain_request':
        return '🎭';
      case 'message':
        return '💌';
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
    <Link
      to={notification.link_url || '#'}
      className={`block p-4 hover:bg-gray-50 border-b last:border-b-0 ${
        !notification.is_read ? 'bg-rose/5' : ''
      }`}
      onClick={() => onRead(notification.id)}
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
  );
};