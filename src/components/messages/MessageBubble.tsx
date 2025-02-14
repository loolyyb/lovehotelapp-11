
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MessageBubbleProps {
  message: any;
  isCurrentUser: boolean;
}

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const isImage = message.content.startsWith('[Image]');
  const imageUrl = isImage ? message.content.match(/\((.*?)\)/)?.[1] : null;

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] p-3 rounded-lg backdrop-blur-sm hover:shadow-lg transition-all duration-300 ${
          isCurrentUser
            ? 'bg-[#f3ebad]/20 text-[#f3ebad] rounded-br-none border-[0.5px] border-[#f3ebad]/30'
            : 'bg-white/10 text-[#f3ebad] rounded-bl-none border-[0.5px] border-[#f3ebad]/30'
        }`}
      >
        {isImage ? (
          <img src={imageUrl} alt="Message" className="max-w-full rounded" />
        ) : (
          <p className="break-words whitespace-pre-wrap">{message.content}</p>
        )}
        <div
          className={`text-xs mt-1 ${
            isCurrentUser ? 'text-[#f3ebad]/70' : 'text-[#f3ebad]/70'
          }`}
        >
          {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
        </div>
      </div>
    </div>
  );
}
