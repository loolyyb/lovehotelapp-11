
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConversationDialog } from "./ConversationDialog";
import { KeywordAlert } from "./KeywordAlert";
import { detectSuspiciousKeywords } from "../utils/keywordDetection";

interface MessagesTableProps {
  messages: any[];
  isLoading: boolean;
  markAsRead: (messageId: string) => Promise<void>;
  getConversationMessages: (conversationId: string) => Promise<any[]>;
}

export function MessagesTable({ 
  messages, 
  isLoading, 
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

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="border-b border-[#f3ebad]/10">
            <TableHead className="text-[#f3ebad]/70 font-montserrat">Date</TableHead>
            <TableHead className="text-[#f3ebad]/70 font-montserrat">De</TableHead>
            <TableHead className="text-[#f3ebad]/70 font-montserrat">À</TableHead>
            <TableHead className="text-[#f3ebad]/70 font-montserrat">Message</TableHead>
            <TableHead className="text-[#f3ebad]/70 font-montserrat">État</TableHead>
            <TableHead className="text-[#f3ebad]/70 font-montserrat">Alerte</TableHead>
            <TableHead className="text-[#f3ebad]/70 font-montserrat">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center font-montserrat text-[#f3ebad]/50"
              >
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Chargement...
                </motion.div>
              </TableCell>
            </TableRow>
          ) : messages.length > 0 ? (
            messages.map((message: any) => {
              const { detectedKeywords } = detectSuspiciousKeywords(message.content);
              const hasSuspiciousContent = detectedKeywords.length > 0;
              
              return (
                <TableRow
                  key={message.id}
                  className={`border-b border-[#f3ebad]/10 hover:bg-[#f3ebad]/5 transition-colors ${
                    hasSuspiciousContent ? 'bg-amber-900/20' : ''
                  }`}
                >
                  <TableCell className="font-montserrat text-[#f3ebad]/70">
                    {format(new Date(message.created_at), "Pp", {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell className="font-montserrat text-[#f3ebad]">
                    {message.sender?.username || message.sender?.full_name || 'Utilisateur inconnu'}
                  </TableCell>
                  <TableCell className="font-montserrat text-[#f3ebad]">
                    {message.recipient?.username || message.recipient?.full_name || 'Utilisateur inconnu'}
                  </TableCell>
                  <TableCell className="font-montserrat text-[#f3ebad]/70">
                    {message.content}
                  </TableCell>
                  <TableCell className="font-montserrat text-[#f3ebad]/70">
                    {message.read_at ? (
                      <span className="text-green-400">Lu</span>
                    ) : (
                      <span className="text-[#f3ebad]/50">Non lu</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {hasSuspiciousContent && (
                      <KeywordAlert detectedKeywords={detectedKeywords} />
                    )}
                  </TableCell>
                  <TableCell className="space-x-2">
                    {!message.read_at && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-[#f3ebad]/70 hover:text-[#f3ebad] border-[#f3ebad]/30 mb-1"
                        onClick={() => markAsRead(message.id)}
                      >
                        Marquer comme lu
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[#f3ebad]/70 hover:text-[#f3ebad] border-[#f3ebad]/30"
                      onClick={() => handleViewConversation(message)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Voir conversation
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center font-montserrat text-[#f3ebad]/50"
              >
                Aucun message
              </TableCell>
            </TableRow>
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
