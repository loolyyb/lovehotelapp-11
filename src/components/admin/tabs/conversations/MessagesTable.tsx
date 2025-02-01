import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageRow } from "./MessageRow";
import { MessageWithProfiles } from "./types";

interface MessagesTableProps {
  messages: MessageWithProfiles[];
}

export function MessagesTable({ messages }: MessagesTableProps) {
  console.log("MessagesTable: Rendering with messages:", {
    messageCount: messages.length,
    firstMessage: messages[0],
    lastMessage: messages[messages.length - 1]
  });

  if (!messages || messages.length === 0) {
    console.log("MessagesTable: No messages to display");
    return (
      <div className="text-center text-gray-500 py-8">
        Aucun message trouvé
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>De</TableHead>
          <TableHead>À</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Statut</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {messages.map((message) => {
          console.log("MessagesTable: Rendering message row:", {
            messageId: message.id,
            senderId: message.sender_id,
            senderName: message?.sender?.full_name
          });
          return <MessageRow key={message.id} message={message} />;
        })}
      </TableBody>
    </Table>
  );
}