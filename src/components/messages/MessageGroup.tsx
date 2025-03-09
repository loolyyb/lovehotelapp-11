
import React from "react";
import { MessageBubble } from "./MessageBubble";

interface MessageGroupProps {
  messages: any[];
  isCurrentUser: boolean;
}

export function MessageGroup({ messages, isCurrentUser }: MessageGroupProps) {
  return (
    <div className={`flex flex-col gap-1 w-full ${isCurrentUser ? 'items-end' : 'items-start'}`}>
      {messages.map((message) => (
        <MessageBubble 
          key={message.id} 
          message={message}
          isCurrentUser={isCurrentUser}
        />
      ))}
    </div>
  );
}
