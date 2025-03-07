
import { useState, useRef } from "react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitTimeoutRef = useRef<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled && !isSubmitting) {
      e.preventDefault();
      if (newMessage.trim()) {
        setIsSubmitting(true);
        onSend(e as any);
        
        // Reset submission state after a short delay
        if (submitTimeoutRef.current) {
          clearTimeout(submitTimeoutRef.current);
        }
        
        submitTimeoutRef.current = window.setTimeout(() => {
          setIsSubmitting(false);
          submitTimeoutRef.current = null;
        }, 1000) as unknown as number;
        
        setIsTyping(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || disabled || !newMessage.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    onSend(e);
    
    // Reset submission state after a short delay
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }
    
    submitTimeoutRef.current = window.setTimeout(() => {
      setIsSubmitting(false);
      submitTimeoutRef.current = null;
    }, 1000) as unknown as number;
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        className="w-full p-3 pr-12 bg-[#f3ebad]/10 border border-[#f3ebad]/20 rounded-md text-[#f3ebad] placeholder:text-[#f3ebad]/50 outline-none focus:border-[#f3ebad]/50 transition-colors resize-none"
        placeholder={disabled ? "Chargement en cours..." : "Votre message..."}
        rows={2}
        value={newMessage}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled || isSubmitting}
      />
      <button
        type="submit"
        className={`absolute right-3 bottom-3 p-2 rounded-full ${
          isTyping && !disabled && !isSubmitting
            ? "bg-[#f3ebad] text-[#40192C]"
            : "bg-[#f3ebad]/20 text-[#f3ebad]/50"
        } transition-colors ${(disabled || isSubmitting) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        disabled={!isTyping || disabled || isSubmitting}
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
}
