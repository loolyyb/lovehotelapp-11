
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, CheckCheck, Loader2, TriangleAlert, X } from "lucide-react";
import { MessageBubble } from "@/components/messages/MessageBubble";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { detectSuspiciousKeywords } from "../utils/keywordDetection";
import { Button } from "@/components/ui/button";

interface ConversationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  user1: { username?: string; full_name?: string } | null;
  user2: { username?: string; full_name?: string } | null;
  getConversationMessages: (id: string) => Promise<any[]>;
}

export function ConversationDialog({
  isOpen,
  onClose,
  conversationId,
  user1,
  user2,
  getConversationMessages,
}: ConversationDialogProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnlySuspicious, setShowOnlySuspicious] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user1Name = user1?.username || user1?.full_name || "Utilisateur 1";
  const user2Name = user2?.username || user2?.full_name || "Utilisateur 2";

  useEffect(() => {
    if (isOpen && conversationId) {
      setIsLoading(true);
      getConversationMessages(conversationId).then((data) => {
        setMessages(data);
        setIsLoading(false);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      });
    }
  }, [isOpen, conversationId, getConversationMessages]);

  const suspiciousMessagesCount = messages.filter(message => 
    detectSuspiciousKeywords(message.content).hasSuspiciousKeywords
  ).length;

  const displayMessages = showOnlySuspicious 
    ? messages.filter(message => detectSuspiciousKeywords(message.content).hasSuspiciousKeywords)
    : messages;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-2 mb-2">
          <DialogTitle className="text-[#f3ebad]">
            Conversation: {user1Name} et {user2Name}
          </DialogTitle>
          <DialogClose className="text-[#f3ebad] hover:text-white">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        {suspiciousMessagesCount > 0 && (
          <div className="bg-amber-950/20 text-amber-400 p-2 mb-2 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <TriangleAlert className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">
                {suspiciousMessagesCount} message{suspiciousMessagesCount > 1 ? 's' : ''} avec mots-clés suspects
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={`text-xs border-amber-500/30 ${
                showOnlySuspicious ? 'bg-amber-500/20' : ''
              }`}
              onClick={() => setShowOnlySuspicious(!showOnlySuspicious)}
            >
              {showOnlySuspicious ? 'Afficher tous' : 'Filtrer suspects'}
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 text-[#f3ebad] animate-spin" />
            </div>
          ) : displayMessages.length > 0 ? (
            <>
              {displayMessages.map((message) => {
                const { detectedKeywords } = detectSuspiciousKeywords(message.content);
                const hasSuspiciousContent = detectedKeywords.length > 0;
                
                return (
                  <div key={message.id} className={`message-container ${
                    hasSuspiciousContent ? 'bg-amber-950/20 p-2 rounded-md' : ''
                  }`}>
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center">
                        <span className="text-xs text-[#f3ebad]/70 mr-2">
                          {format(new Date(message.created_at), "dd/MM/yyyy HH:mm", {
                            locale: fr,
                          })}
                        </span>
                        <span className="text-xs font-semibold text-[#f3ebad]">
                          {message.sender.username || message.sender.full_name}:
                        </span>
                      </div>
                      
                      {hasSuspiciousContent && (
                        <div className="flex items-center text-amber-500">
                          <TriangleAlert className="h-3 w-3 mr-1" />
                          <span className="text-xs">
                            {detectedKeywords.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <MessageBubble 
                      message={message} 
                      isCurrentUser={false} 
                    />
                    
                    <div className="flex justify-end mt-1">
                      {message.read_at ? (
                        <span className="text-xs text-emerald-400 flex items-center">
                          <CheckCheck className="w-3 h-3 mr-1" /> Lu le{" "}
                          {format(new Date(message.read_at), "dd/MM HH:mm", {
                            locale: fr,
                          })}
                        </span>
                      ) : (
                        <span className="text-xs text-[#f3ebad]/50 flex items-center">
                          <Check className="w-3 h-3 mr-1" /> Non lu
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="text-center text-[#f3ebad]/50">
              {showOnlySuspicious 
                ? "Aucun message suspect dans cette conversation" 
                : "Aucun message dans cette conversation"}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
