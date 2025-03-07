
import React from "react";
import { ConversationList } from "@/components/messages/ConversationList";
import { MessageView } from "@/components/messages/MessageView";
import { EmptyState } from "@/components/messages/EmptyState";

interface MessagesContainerProps {
  selectedConversation: string | null;
  onSelectConversation: (conversationId: string) => void;
  onBack: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isNetworkError: boolean;
}

export function MessagesContainer({
  selectedConversation,
  onSelectConversation,
  onBack,
  onRefresh,
  isRefreshing,
  isNetworkError
}: MessagesContainerProps) {
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#40192C] pt-12 backdrop-blur-sm">
      <div className={`w-full md:w-[380px] border-r border-[#f3ebad]/30 hover:shadow-lg transition-all duration-300 ${selectedConversation ? 'hidden md:block' : ''}`}>
        <ConversationList
          onSelectConversation={onSelectConversation}
          selectedConversationId={selectedConversation}
          onNetworkError={() => {}} // This will be handled at a higher level
        />
      </div>
      
      <div className={`flex-1 ${!selectedConversation ? 'hidden md:flex' : ''}`}>
        {selectedConversation ? (
          <MessageView
            key={selectedConversation}
            conversationId={selectedConversation}
            onBack={onBack}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState 
              onRefresh={onRefresh}
              isRefreshing={isRefreshing}
              isNetworkError={isNetworkError}
            />
          </div>
        )}
      </div>
    </div>
  );
}
