
import { useState } from "react";
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
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRefresh = () => {
    // Start animation immediately on click
    setIsAnimating(true);
    
    // Call the refresh function
    refreshMessages();
    
    // Reset animation if server responds quickly (before visual feedback is useful)
    if (!isRefreshing) {
      // Keep animation for at least 500ms to ensure user sees feedback
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }
  };

  // When isRefreshing changes from true to false, stop the animation
  if (!isRefreshing && isAnimating) {
    setTimeout(() => {
      setIsAnimating(false);
    }, 300); // Small delay to ensure smooth transition
  }

  return (
    <div className="py-4 px-4 border-b border-[#f3ebad]/30 flex items-center hover:shadow-lg transition-all duration-300">
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
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="p-2 hover:bg-white/10 rounded-full transition-colors"
        title="Rafraîchir les messages"
      >
        <RefreshCw className={`w-5 h-5 text-[#f3ebad] ${isRefreshing || isAnimating ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}
