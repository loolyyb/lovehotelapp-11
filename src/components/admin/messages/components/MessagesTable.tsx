
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { ConversationDialog } from "./ConversationDialog";
import { TableLoadingState } from "./TableLoadingState";
import { TableErrorState } from "./TableErrorState";
import { TableEmptyState } from "./TableEmptyState";
import { MessageTableRow } from "./MessageTableRow";
import { MessageTableHeader } from "./MessageTableHeader";

interface MessagesTableProps {
  messages: any[];
  isLoading: boolean;
  isError?: boolean;
  markAsRead: (messageId: string) => Promise<void>;
  getConversationMessages: (conversationId: string) => Promise<any[]>;
}

export function MessagesTable({ 
  messages, 
  isLoading,
  isError = false,
  markAsRead,
  getConversationMessages 
}: MessagesTableProps) {
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    user1: any;
    user2: any;
  } | null>(null);

  const handleViewConversation = (message: any) => {
    if (!message.conversation_id) {
      console.error("Cannot view conversation - missing conversation_id", message);
      return;
    }
    
    console.log("Viewing conversation:", message.conversation_id);
    
    setSelectedConversation({
      id: message.conversation_id,
      user1: message.sender || { username: 'Utilisateur inconnu' },
      user2: message.recipient || { username: 'Utilisateur inconnu' }
    });
    setIsConversationOpen(true);
  };

  // Render loading state
  if (isLoading) {
    return (
      <Table>
        <MessageTableHeader />
        <TableBody>
          <TableLoadingState />
        </TableBody>
      </Table>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Table>
        <MessageTableHeader />
        <TableBody>
          <TableErrorState />
        </TableBody>
      </Table>
    );
  }

  // Render empty state
  if (!messages || messages.length === 0) {
    return (
      <Table>
        <MessageTableHeader />
        <TableBody>
          <TableEmptyState />
        </TableBody>
      </Table>
    );
  }

  return (
    <>
      <Table>
        <MessageTableHeader />
        <TableBody>
          {messages.map((message: any) => (
            <MessageTableRow 
              key={message.id}
              message={message}
              markAsRead={markAsRead}
              onViewConversation={handleViewConversation}
            />
          ))}
        </TableBody>
      </Table>

      {selectedConversation && (
        <ConversationDialog
          isOpen={isConversationOpen}
          onClose={() => setIsConversationOpen(false)}
          conversationId={selectedConversation.id}
          user1={selectedConversation.user1}
          user2={selectedConversation.user2}
          getConversationMessages={getConversationMessages}
        />
      )}
    </>
  );
}
