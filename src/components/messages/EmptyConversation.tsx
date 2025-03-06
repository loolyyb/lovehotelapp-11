
import { MessageSquare } from "lucide-react";

export function EmptyConversation() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-[#f3ebad]/10 flex items-center justify-center">
        <MessageSquare className="w-8 h-8 text-[#f3ebad]/70" />
      </div>
      <h3 className="text-lg font-medium text-[#f3ebad]">Pas de messages</h3>
      <p className="text-sm text-[#f3ebad]/70 max-w-sm">
        Cette conversation ne contient pas encore de messages. 
        Envoyez un message pour démarrer la conversation.
      </p>
    </div>
  );
}
