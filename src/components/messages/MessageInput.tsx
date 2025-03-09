import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSend: (e?: React.FormEvent) => void;
  disabled?: boolean;
}

export function MessageInput({ 
  newMessage, 
  setNewMessage, 
  onSend, 
  disabled = false 
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSending, setIsSending] = useState(false);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
  };

  // Handle key press (Enter to send, Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled && newMessage.trim()) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle send button click
  const handleSend = () => {
    if (disabled || isSending || !newMessage.trim()) return;
    
    setIsSending(true);
    // Call onSend without passing an event argument since it's a button click
    onSend();
    
    // Reset sending state after a short delay
    setTimeout(() => {
      setIsSending(false);
      
      // Focus back on textarea
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 300);
  };
  
  // Auto-resize the textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to calculate properly
    textarea.style.height = 'auto';
    
    // Set new height based on scrollHeight, but cap it at 150px
    const newHeight = Math.min(textarea.scrollHeight, 150);
    textarea.style.height = `${newHeight}px`;
  }, [newMessage]);

  // Focus the textarea when the component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="p-3 border-t border-[#f3ebad]/10 bg-[#40192C]/50">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={newMessage}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message..."
            className="min-h-[40px] max-h-[150px] pr-12 bg-[#f3ebad]/5 border-[#f3ebad]/20 text-[#f3ebad] resize-none"
            disabled={disabled || isSending}
          />
          <Button
            className={`absolute bottom-1 right-1 h-8 w-8 p-0 rounded-full ${
              !newMessage.trim() || disabled || isSending 
                ? 'bg-[#f3ebad]/20 text-[#f3ebad]/30 hover:bg-[#f3ebad]/20 cursor-not-allowed' 
                : 'bg-[#CD0067] text-white hover:bg-[#CD0067]/90'
            }`}
            disabled={!newMessage.trim() || disabled || isSending}
            onClick={handleSend}
            type="button"
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
