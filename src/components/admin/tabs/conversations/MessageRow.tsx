import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageWithProfiles } from "./types";

interface MessageRowProps {
  message: MessageWithProfiles;
}

export function MessageRow({ message }: MessageRowProps) {
  console.log("MessageRow: Rendering message:", {
    id: message.id,
    sender: message.sender,
    conversation: message.conversation,
    content: message.content?.substring(0, 50) + "..."
  });

  const senderName = message.sender?.full_name || message.sender?.username || "Inconnu";
  const recipientName = message.conversation?.user2?.full_name || 
                       message.conversation?.user2?.username || "Inconnu";

  return (
    <TableRow>
      <TableCell>{senderName}</TableCell>
      <TableCell>{recipientName}</TableCell>
      <TableCell>{message.content}</TableCell>
      <TableCell>
        {format(new Date(message.created_at), "Pp", { locale: fr })}
      </TableCell>
      <TableCell>
        {message.read_at ? (
          <span className="text-green-500">Lu</span>
        ) : (
          <span className="text-gray-500">Non lu</span>
        )}
      </TableCell>
    </TableRow>
  );
}