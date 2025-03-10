
import { memo, useEffect } from "react";
import { ConversationItem } from "./ConversationItem";
import { useLogger } from "@/hooks/useLogger";

interface ConversationItemsProps {
  conversations: any[];
  selectedConversationId: string | null;
  currentProfileId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

// Using memo to prevent unnecessary re-renders
export const ConversationItems = memo(function ConversationItems({
  conversations,
  selectedConversationId,
  currentProfileId,
  onSelectConversation
}: ConversationItemsProps) {
  const logger = useLogger("ConversationItems");
  
  // Log conversation details on render
  useEffect(() => {
    logger.info("Rendering conversation items with data", { 
      count: conversations.length, 
      selectedId: selectedConversationId,
      conversationIds: conversations.map(c => c.id),
      hasCurrentProfile: !!currentProfileId
    });
  }, [conversations, selectedConversationId, currentProfileId, logger]);
  
  if (!conversations || conversations.length === 0) {
    logger.info("No conversations to render");
    return null;
  }
  
  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map(conversation => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={selectedConversationId === conversation.id}
          currentProfileId={currentProfileId}
          onSelect={() => onSelectConversation(conversation.id)}
        />
      ))}
    </div>
  );
});
