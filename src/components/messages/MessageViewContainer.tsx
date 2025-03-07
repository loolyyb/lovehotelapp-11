
import React from "react";
import { MessageHeader } from "./MessageHeader";

interface MessageViewContainerProps {
  onBack: () => void;
  refreshMessages: () => void;
  isRefreshing: boolean;
  otherUser: any;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function MessageViewContainer({ 
  onBack, 
  refreshMessages, 
  isRefreshing, 
  otherUser, 
  children,
  footer
}: MessageViewContainerProps) {
  return (
    <div className="flex flex-col h-full bg-[#40192C] backdrop-blur-sm border-[0.5px] border-[#f3ebad]/30">
      <MessageHeader 
        onBack={onBack} 
        refreshMessages={refreshMessages} 
        isRefreshing={isRefreshing}
        otherUser={otherUser}
      />

      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      <div className="p-4 border-t border-[#f3ebad]/30 hover:shadow-lg transition-all duration-300">
        {footer}
      </div>
    </div>
  );
}
