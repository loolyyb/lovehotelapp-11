
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useLogger } from "@/hooks/useLogger";

interface ConversationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  user1: any;
  user2: any;
  getConversationMessages: (conversationId: string) => Promise<any[]>;
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
  const logger = useLogger("ConversationDialog");

  useEffect(() => {
    let mounted = true;
    
    async function fetchMessages() {
      if (!isOpen || !conversationId) return;
      
      setIsLoading(true);
      
      try {
        logger.info("Fetching conversation messages", { conversationId });
        const conversationMessages = await getConversationMessages(conversationId);
        
        if (mounted) {
          setMessages(conversationMessages);
          logger.info(`Loaded ${conversationMessages.length} messages`);
        }
      } catch (error) {
        logger.error("Error fetching conversation messages", { error });
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchMessages();
    
    return () => {
      mounted = false;
    };
  }, [conversationId, isOpen, getConversationMessages, logger]);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#40192C] border-[#f3ebad]/20 text-[#f3ebad] max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-[#f3ebad] font-cormorant text-xl">
            Conversation entre {user1?.username || "Utilisateur 1"} et{" "}
            {user2?.username || "Utilisateur 2"}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-[#f3ebad]/60">
              Chargement de la conversation...
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage
                      src={message.sender?.avatar_url}
                      alt={message.sender?.username || "User"}
                    />
                    <AvatarFallback className="bg-[#f3ebad]/10 text-[#f3ebad]">
                      {getInitials(message.sender?.username || message.sender?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex gap-2 items-baseline">
                      <span className="text-[#f3ebad] font-semibold">
                        {message.sender?.username || "Utilisateur"}
                      </span>
                      <span className="text-xs text-[#f3ebad]/50">
                        {format(new Date(message.created_at), "Pp", {
                          locale: fr,
                        })}
                      </span>
                    </div>
                    <p className="text-[#f3ebad]/80 mt-1">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#f3ebad]/60">
              Aucun message dans cette conversation
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
