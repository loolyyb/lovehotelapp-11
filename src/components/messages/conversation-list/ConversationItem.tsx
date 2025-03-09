
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ConversationItemProps {
  conversation: any;
  isActive: boolean;
  currentProfileId: string | null;
  onSelect: () => void;
}

const DEFAULT_AVATAR_URL = "https://lovehotelapp.com/wp-content/uploads/2025/02/avatar-love-hotel-v2.jpg";

export function ConversationItem({
  conversation,
  isActive,
  currentProfileId,
  onSelect
}: ConversationItemProps) {
  const otherUser = conversation.otherUser;
  const lastMessage = conversation.messages?.[0];
  
  const unreadCount = conversation.messages?.filter((msg: any) => 
    !msg.read_at && msg.sender_id !== currentProfileId
  )?.length || 0;
  
  const [previousUnreadCount, setPreviousUnreadCount] = useState(unreadCount);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [showUnreadBadge, setShowUnreadBadge] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Effect for new message animation
  useEffect(() => {
    // Check if unread count increased since last render
    if (unreadCount > previousUnreadCount && previousUnreadCount !== 0) {
      setHasNewMessages(true);
      
      // Clear any existing timeout
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      // Set timeout to remove animation after 3 seconds
      animationTimeoutRef.current = setTimeout(() => {
        setHasNewMessages(false);
      }, 3000);
    }
    
    // Update previous count for next comparison
    setPreviousUnreadCount(unreadCount);
    
    // Cleanup timeout on unmount
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [unreadCount, previousUnreadCount]);

  // Effect to handle badge fading when conversation is active
  useEffect(() => {
    // When conversation becomes active and has unread messages
    if (isActive && unreadCount > 0 && showUnreadBadge) {
      // Set a timeout to start fading after 15 seconds
      fadeTimeoutRef.current = setTimeout(() => {
        setIsFading(true);
        
        // Set another timeout to hide badge after fade animation completes
        setTimeout(() => {
          setShowUnreadBadge(false);
        }, 1000); // Fade out animation duration
      }, 15000); // 15 seconds delay before starting fade
    }
    
    // Reset states when conversation becomes inactive
    if (!isActive) {
      setIsFading(false);
      setShowUnreadBadge(true);
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    }
    
    // Cleanup timeout on component unmount or when props change
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, [isActive, unreadCount, showUnreadBadge]);
  
  const activeConversationBgClass = "bg-[#5A293D]";
  const hoverClass = "hover:bg-rose/5";
  
  // Custom click handler to track conversation selection
  const handleSelect = () => {
    onSelect();
  };
  
  return (
    <div 
      className={`p-4 border-b border-rose/20 cursor-pointer transition-colors ${
        isActive 
          ? `${activeConversationBgClass} border-r-0` 
          : hoverClass
      }`} 
      onClick={handleSelect}
    >
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={otherUser?.avatar_url || DEFAULT_AVATAR_URL} />
          <AvatarFallback>
            <img src={DEFAULT_AVATAR_URL} alt="Default Avatar" className="w-full h-full object-cover" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h3 className="font-medium text-[#f3ebad] truncate">
              {otherUser?.full_name || otherUser?.username || "Utilisateur"}
            </h3>
            {lastMessage && <span className="text-xs text-[#f3ebad]/50">
                {format(new Date(lastMessage.created_at), 'HH:mm', {
                  locale: fr
                })}
              </span>}
          </div>
          <div className="flex justify-between items-center">
            {lastMessage && <p className="text-sm text-[#f3ebad]/70 truncate">
              {lastMessage.content}
            </p>}
            
            {unreadCount > 0 && showUnreadBadge && (
              <span 
                className={`ml-2 bg-[#CD0067] text-white text-xs font-medium px-2 py-0.5 rounded-full transition-all duration-300 ${
                  hasNewMessages ? 'animate-pulse shadow-lg shadow-[#CD0067]/30' : ''
                } ${
                  isFading ? 'opacity-0 transition-opacity duration-1000' : 'opacity-100'
                }`}
              >
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
