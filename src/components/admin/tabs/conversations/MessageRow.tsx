import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageWithProfiles } from "./types";

interface MessageRowProps {
  message: MessageWithProfiles;
}

export function MessageRow({ message }: MessageRowProps) {
  const sender = message.sender?.full_name || message.sender?.username || message.sender_id;
  const user1Name = message.conversation?.user1?.full_name || message.conversation?.user1?.username;
  const user2Name = message.conversation?.user2?.full_name || message.conversation?.user2?.username;
  const recipient = user1Name === sender ? user2Name : user1Name;

  return (
    <TableRow key={message.id}>
      <TableCell className="font-medium">{sender}</TableCell>
      <TableCell>{recipient}</TableCell>
      <TableCell className="max-w-md truncate">
        {message.content}
      </TableCell>
      <TableCell>
        {format(new Date(message.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
      </TableCell>
      <TableCell>
        {message.read_at ? (
          <span className="text-green-600">Lu</span>
        ) : (
          <span className="text-yellow-600">Non lu</span>
        )}
      </TableCell>
    </TableRow>
  );
}