
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { KeywordAlert } from "./KeywordAlert";
import { detectSuspiciousKeywords } from "../utils/keywordDetection";

interface MessageTableRowProps {
  message: any;
  markAsRead: (messageId: string) => Promise<void>;
  onViewConversation: (message: any) => void;
}

export function MessageTableRow({ 
  message, 
  markAsRead, 
  onViewConversation 
}: MessageTableRowProps) {
  // Safely check for content before running detection
  const { detectedKeywords } = message.content 
    ? detectSuspiciousKeywords(message.content) 
    : { detectedKeywords: [] };
  const hasSuspiciousContent = detectedKeywords.length > 0;
  
  return (
    <TableRow
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
        {message.content || '(Aucun contenu)'}
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
          onClick={() => onViewConversation(message)}
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          Voir conversation
        </Button>
      </TableCell>
    </TableRow>
  );
}
