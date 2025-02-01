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
  console.log("MessagesTable: Rendering with messages count:", messages.length);

  const sortedMessages = React.useMemo(() => {
    return [...messages].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Aucun message trouvé
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">De</TableHead>
            <TableHead className="w-[150px]">À</TableHead>
            <TableHead>Message</TableHead>
            <TableHead className="w-[180px]">Date</TableHead>
            <TableHead className="w-[100px]">Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMessages.map((message) => (
            <MessageRow key={message.id} message={message} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}