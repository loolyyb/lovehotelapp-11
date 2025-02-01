import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageWithProfiles } from "./types";
import { Badge } from "@/components/ui/badge";

interface MessageRowProps {
  message: MessageWithProfiles;
}

export function MessageRow({ message }: MessageRowProps) {
  console.log("MessageRow: Rendering message:", {
    id: message.id,
    sender: message.sender?.full_name,
    recipient: message.conversation?.user2?.full_name,
    timestamp: message.created_at
  });

  const senderName = message.sender?.full_name || message.sender?.username || "Inconnu";
  const recipientName = message.conversation?.user2?.full_name || 
                       message.conversation?.user2?.username || "Inconnu";

  const formattedDate = React.useMemo(() => {
    return format(new Date(message.created_at), "Pp", { locale: fr });
  }, [message.created_at]);

  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell className="font-medium">{senderName}</TableCell>
      <TableCell>{recipientName}</TableCell>
      <TableCell className="max-w-[300px] truncate">{message.content}</TableCell>
      <TableCell>{formattedDate}</TableCell>
      <TableCell>
        {message.read_at ? (
          <Badge variant="success" className="bg-green-500">Lu</Badge>
        ) : (
          <Badge variant="secondary">Non lu</Badge>
        )}
      </TableCell>
    </TableRow>
  );
}