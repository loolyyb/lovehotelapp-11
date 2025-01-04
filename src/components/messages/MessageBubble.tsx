import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MessageBubbleProps {
  message: any;
  isCurrentUser: boolean;
}

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] p-3 rounded-lg ${
          isCurrentUser
            ? 'bg-burgundy text-white rounded-br-none'
            : 'bg-rose/20 text-gray-800 rounded-bl-none'
        }`}
      >
        <p className="break-words">{message.content}</p>
        <div
          className={`text-xs mt-1 ${
            isCurrentUser ? 'text-rose/80' : 'text-gray-500'
          }`}
        >
          {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
        </div>
      </div>
    </div>
  );
}