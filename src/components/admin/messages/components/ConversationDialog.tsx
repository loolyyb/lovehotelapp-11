
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, CheckCheck, Loader2, X } from "lucide-react";
import { MessageBubble } from "@/components/messages/MessageBubble";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-2 mb-4">
          <DialogTitle className="text-[#f3ebad]">
            Conversation: {user1Name} et {user2Name}
          </DialogTitle>
          <DialogClose className="text-[#f3ebad] hover:text-white">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 text-[#f3ebad] animate-spin" />
            </div>
          ) : messages.length > 0 ? (
            <>
              {messages.map((message) => (
                <div key={message.id} className="message-container">
                  <div className="flex justify-start mb-1">
                    <span className="text-xs text-[#f3ebad]/70 mr-2">
                      {format(new Date(message.created_at), "dd/MM/yyyy HH:mm", {
                        locale: fr,
                      })}
                    </span>
                    <span className="text-xs font-semibold text-[#f3ebad]">
                      {message.sender.username || message.sender.full_name}:
                    </span>
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
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="text-center text-[#f3ebad]/50">
              Aucun message dans cette conversation
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
