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
  if (!messages || messages.length === 0) {
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
        {messages.map((message) => (
          <MessageRow key={message.id} message={message} />
        ))}
      </TableBody>
    </Table>
  );
}