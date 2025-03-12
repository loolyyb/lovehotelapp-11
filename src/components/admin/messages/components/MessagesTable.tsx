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
    setSelectedConversation({
      id: message.conversation_id,
      user1: message.sender,
      user2: message.recipient
    });
    setIsConversationOpen(true);
  };

  // Render error state
  if (isError) {
    return (
      <div className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-[#f3ebad] mb-2">
          Erreur lors du chargement des messages
        </h3>
        <p className="text-[#f3ebad]/70 mb-4">
          Une erreur est survenue lors de la récupération des messages. Veuillez réessayer ultérieurement.
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <MessageTableHeader />
        <TableBody>
          {isLoading ? (
            <TableLoadingState />
          ) : messages.length > 0 ? (
            messages.map((message: any) => (
              <MessageTableRow 
                key={message.id}
                message={message}
                markAsRead={markAsRead}
                onViewConversation={handleViewConversation}
              />
            ))
          ) : (
            <TableEmptyState />
          )}
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
