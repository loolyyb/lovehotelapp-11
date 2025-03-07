
import { useState } from "react";
import { Send } from "lucide-react";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSend: (e: React.FormEvent) => void;
  disabled?: boolean;
}

export function MessageInput({ 
  newMessage, 
  setNewMessage, 
  onSend,
  disabled = false
}: MessageInputProps) {
  const [isTyping, setIsTyping] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      if (newMessage.trim()) {
        onSend(e as any);
        setIsTyping(false);
      }
    }
  };

  return (
    <form onSubmit={onSend} className="relative">
      <textarea
        className="w-full p-3 pr-12 bg-[#f3ebad]/10 border border-[#f3ebad]/20 rounded-md text-[#f3ebad] placeholder:text-[#f3ebad]/50 outline-none focus:border-[#f3ebad]/50 transition-colors resize-none"
        placeholder={disabled ? "Chargement en cours..." : "Votre message..."}
        rows={2}
        value={newMessage}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button
        type="submit"
        className={`absolute right-3 bottom-3 p-2 rounded-full ${
          isTyping && !disabled
            ? "bg-[#f3ebad] text-[#40192C]"
            : "bg-[#f3ebad]/20 text-[#f3ebad]/50"
        } transition-colors ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        disabled={!isTyping || disabled}
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
}
