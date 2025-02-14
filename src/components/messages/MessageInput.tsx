
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormEvent } from "react";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSend: (e: FormEvent) => void;
}

export function MessageInput({ newMessage, setNewMessage, onSend }: MessageInputProps) {
  return (
    <form onSubmit={onSend} className="flex space-x-2">
      <Input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Écrivez votre message..."
        className="flex-1 bg-white/5 border-[#f3ebad]/30 text-[#f3ebad] placeholder:text-[#f3ebad]/50"
      />
      <Button 
        type="submit"
        className="bg-[#f3ebad]/20 text-[#f3ebad] hover:bg-[#f3ebad]/30"
        disabled={!newMessage.trim()}
      >
        Envoyer
      </Button>
    </form>
  );
}
