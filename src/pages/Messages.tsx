
import { useState, useEffect, useCallback, memo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { MessageView } from "@/components/messages/MessageView";
import { ConversationList } from "@/components/messages/ConversationList";
import { useLogger } from "@/hooks/useLogger";

// Memoized MessageView to prevent unnecessary re-renders
const MemoizedMessageView = memo(({ conversationId, onBack }: { conversationId: string, onBack: () => void }) => {
  return (
    <MessageView 
      key={conversationId}
      conversationId={conversationId}
      onBack={onBack}
    />
  );
});

MemoizedMessageView.displayName = 'MemoizedMessageView';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const location = useLocation();
  const logger = useLogger("Messages");
  const previousConversationRef = useRef<string | null>(null);

  useEffect(() => {
    logger.info("Messages page mounted");
    
    if (location.state?.conversationId) {
      logger.info("Setting conversation from location state", { conversationId: location.state.conversationId });
      setSelectedConversation(location.state.conversationId);
    }
  }, [location.state, logger]);

  const handleSelectConversation = useCallback((conversationId: string) => {
    // Si on clique sur la conversation déjà sélectionnée, on ne fait rien
    if (selectedConversation === conversationId) {
      logger.info("Conversation already selected, ignoring", { conversationId });
      return;
    }
    
    // Mémoriser l'ancienne valeur pour le logging
    previousConversationRef.current = selectedConversation;
    
    logger.info("Changing selected conversation", { 
      from: previousConversationRef.current, 
      to: conversationId 
    });
    
    // Mettre à jour la conversation sélectionnée
    setSelectedConversation(conversationId);
  }, [selectedConversation, logger]);

  const handleBack = useCallback(() => {
    logger.info("Navigating back from conversation view");
    setSelectedConversation(null);
  }, [logger]);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#40192C] pt-12 backdrop-blur-sm">
      <div className={`w-full md:w-[380px] border-r border-[#f3ebad]/30 hover:shadow-lg transition-all duration-300 ${selectedConversation ? 'hidden md:block' : ''}`}>
        <ConversationList
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversation}
        />
      </div>
      
      <div className={`flex-1 ${!selectedConversation ? 'hidden md:flex' : ''}`}>
        {selectedConversation ? (
          <MemoizedMessageView
            conversationId={selectedConversation}
            onBack={handleBack}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#f3ebad]/70">
            <p>Sélectionnez une conversation pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
}
