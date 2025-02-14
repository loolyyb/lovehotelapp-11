
import { useState, useEffect } from "react";
import { MessageView } from "@/components/messages/MessageView";
import { ConversationList } from "@/components/messages/ConversationList";
import { useLocation } from "react-router-dom";

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.conversationId) {
      setSelectedConversation(location.state.conversationId);
    }
  }, [location.state]);

  const handleSelectConversation = (conversationId: string) => {
    // Si on clique sur la conversation déjà sélectionnée, on ne fait rien
    if (selectedConversation === conversationId) return;
    
    // Sinon, on met à jour la conversation sélectionnée
    setSelectedConversation(conversationId);
  };

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
          <MessageView
            key={selectedConversation}
            conversationId={selectedConversation}
            onBack={() => setSelectedConversation(null)}
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
