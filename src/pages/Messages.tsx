
import { useState, useEffect, useCallback, memo } from "react";
import { useLocation } from "react-router-dom";
import { MessageView } from "@/components/messages/MessageView";
import { ConversationList } from "@/components/messages/ConversationList";

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

  useEffect(() => {
    if (location.state?.conversationId) {
      setSelectedConversation(location.state.conversationId);
    }
  }, [location.state]);

  const handleSelectConversation = useCallback((conversationId: string) => {
    // Si on clique sur la conversation déjà sélectionnée, on ne fait rien
    if (selectedConversation === conversationId) return;
    
    // Sinon, on met à jour la conversation sélectionnée
    setSelectedConversation(conversationId);
  }, [selectedConversation]);

  const handleBack = useCallback(() => {
    setSelectedConversation(null);
  }, []);

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
