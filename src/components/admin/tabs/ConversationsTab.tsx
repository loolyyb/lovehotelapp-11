import React from "react";
import { Card } from "@/components/ui/card";
import { MessagesTable } from "./conversations/MessagesTable";
import { useMessages } from "./conversations/useMessages";

export function ConversationsTab() {
  const { data: messages, isLoading, error } = useMessages();

  console.log("ConversationsTab render state:", { 
    hasMessages: !!messages, 
    messageCount: messages?.length,
    isLoading, 
    hasError: !!error 
  });

  if (isLoading) {
    console.log("ConversationsTab: Loading state");
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">Chargement des messages...</div>
      </Card>
    );
  }

  if (error) {
    console.error("ConversationsTab: Error state", error);
    return (
      <Card className="p-6">
        <div className="text-center text-rose-500">Erreur lors du chargement des messages</div>
      </Card>
    );
  }

  console.log("ConversationsTab: Rendering messages table with data:", messages);
  return (
    <Card className="p-6">
      <MessagesTable messages={messages || []} />
    </Card>
  );
}