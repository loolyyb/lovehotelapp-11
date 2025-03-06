
import { ChevronLeft, RefreshCw } from "lucide-react";

interface MessageHeaderProps {
  onBack: () => void;
  refreshMessages: () => void;
  isRefreshing: boolean;
  otherUser: any;
}

export function MessageHeader({ 
  onBack, 
  refreshMessages, 
  isRefreshing, 
  otherUser 
}: MessageHeaderProps) {
  return (
    <div className="p-4 border-b border-[#f3ebad]/30 flex items-center hover:shadow-lg transition-all duration-300">
      <button 
        onClick={onBack}
        className="md:hidden mr-2 p-2 hover:bg-white/10 rounded-full transition-colors"
      >
        <ChevronLeft className="w-6 h-6 text-[#f3ebad]" />
      </button>
      {otherUser && (
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-[#f3ebad]">
            {otherUser?.username || otherUser?.full_name || 'Chat'}
          </h2>
        </div>
      )}
      <button 
        onClick={refreshMessages}
        disabled={isRefreshing}
        className="p-2 hover:bg-white/10 rounded-full transition-colors"
        title="Rafraîchir les messages"
      >
        <RefreshCw className={`w-5 h-5 text-[#f3ebad] ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}
