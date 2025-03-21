
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    created_at: string;
    read_at: string | null;
    sender_id: string;
    conversation_id: string;
    media_url?: string;
    media_type?: string;
    sender?: {
      id: string;
      username: string;
      full_name: string;
      avatar_url?: string;
    };
  };
  isCurrentUser: boolean;
}

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const isImage = message.media_type === 'image' || 
                 (message.content && message.content.startsWith('[Image]'));
  
  const imageUrl = isImage 
    ? (message.media_url || (message.content && message.content.match(/\((.*?)\)/)?.[1])) 
    : null;

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} w-full`}>
      <div
        className={`max-w-[70%] min-w-0 p-3 pr-5 rounded-lg backdrop-blur-sm hover:shadow-lg transition-all duration-300 ${
          isCurrentUser
            ? 'bg-[#f3ebad]/20 text-[#f3ebad] rounded-br-none border-[0.5px] border-[#f3ebad]/30'
            : 'bg-white/10 text-[#f3ebad] rounded-bl-none border-[0.5px] border-[#f3ebad]/30'
        }`}
      >
        {isImage && imageUrl ? (
          <img src={imageUrl} alt="Message" className="max-w-full rounded" />
        ) : (
          <p className="break-words whitespace-pre-wrap">{message.content}</p>
        )}
        <div
          className={`flex items-center gap-1 mt-1 ${
            isCurrentUser ? 'text-[#f3ebad]' : 'text-[#f3ebad]/70'
          }`}
        >
          <span className="text-xs whitespace-nowrap">
            {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
          </span>
          {isCurrentUser && (
            <span className="ml-1">
              {message.read_at ? (
                <CheckCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <Check className="w-4 h-4 text-[#f3ebad]" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
