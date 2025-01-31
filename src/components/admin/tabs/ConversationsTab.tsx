import React from "react";
import { Card } from "@/components/ui/card";
import { MessagesTable } from "./conversations/MessagesTable";
import { useMessages } from "./conversations/useMessages";

export function ConversationsTab() {
  const { data: messages, isLoading, error } = useMessages();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">Chargement des messages...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-rose-500">Erreur lors du chargement des messages</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <MessagesTable messages={messages || []} />
    </Card>
  );
}