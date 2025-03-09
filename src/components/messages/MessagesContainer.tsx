
import React from "react";
import { ConversationList } from "@/components/messages/ConversationList";
import { MessageView } from "@/components/messages/MessageView";
import { EmptyState } from "@/components/messages/EmptyState";

interface MessagesContainerProps {
  selectedConversation: string | null;
  onSelectConversation: (conversationId: string) => void;
  onBack: () => void;
  onNetworkError: () => void;
  isRefreshing?: boolean;
  isNetworkError?: boolean;
  onRefresh?: () => void;
}

export function MessagesContainer({
  selectedConversation,
  onSelectConversation,
  onBack,
  onNetworkError,
  isRefreshing = false,
  isNetworkError = false,
  onRefresh = () => {}
}: MessagesContainerProps) {
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#40192C] pt-12 backdrop-blur-sm">
      {/* Conversation list - always visible on desktop, toggles on mobile */}
      <div className={`md:block ${selectedConversation ? 'hidden' : 'w-full'} md:w-[380px] border-r-0 border-[#f3ebad]/30`}>
        <ConversationList
          onSelectConversation={onSelectConversation}
          selectedConversationId={selectedConversation}
          onNetworkError={onNetworkError}
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
