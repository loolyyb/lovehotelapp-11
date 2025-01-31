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
        {messages?.map((message) => (
          <MessageRow key={message.id} message={message} />
        ))}
      </TableBody>
    </Table>
  );
}