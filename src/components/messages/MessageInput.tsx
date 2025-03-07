
import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSend: (e: React.FormEvent) => void;
  disabled?: boolean;
}

export function MessageInput({ 
  newMessage: externalNewMessage, 
  setNewMessage: externalSetNewMessage, 
  onSend,
  disabled = false
}: MessageInputProps) {
  // Use internal state to prevent input loss during parent re-renders
  const [internalNewMessage, setInternalNewMessage] = useState(externalNewMessage);
  const [isTyping, setIsTyping] = useState(Boolean(externalNewMessage));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitTimeoutRef = useRef<number | null>(null);
  const lastSubmitTimeRef = useRef<number>(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const synchronizingRef = useRef<boolean>(false);

  // Sync external and internal state carefully
  useEffect(() => {
    if (!synchronizingRef.current && externalNewMessage !== internalNewMessage) {
      setInternalNewMessage(externalNewMessage);
    }
  }, [externalNewMessage, internalNewMessage]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInternalNewMessage(newValue);
    setIsTyping(newValue.length > 0);
    
    // Prevent external state synchronization in next render cycle
    synchronizingRef.current = true;
    externalSetNewMessage(newValue);
    
    // Reset synchronization lock after a short delay
    setTimeout(() => {
      synchronizingRef.current = false;
    }, 50);
  }, [externalSetNewMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled && !isSubmitting) {
      e.preventDefault();
      
      const now = Date.now();
      // Prevent rapid resubmissions (within 1000ms)
      if (now - lastSubmitTimeRef.current < 1000) {
        return;
      }
      
      if (internalNewMessage.trim()) {
        lastSubmitTimeRef.current = now;
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
  }, [internalNewMessage, onSend, disabled, isSubmitting]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const now = Date.now();
    // Prevent rapid resubmissions (within 1000ms)
    if (isSubmitting || disabled || !internalNewMessage.trim() || now - lastSubmitTimeRef.current < 1000) {
      return;
    }
    
    lastSubmitTimeRef.current = now;
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
  }, [internalNewMessage, onSend, disabled, isSubmitting]);

  // Make sure input focuses when component mounts
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current && !disabled) {
        inputRef.current.focus();
      }
    };
    
    // Small delay to ensure DOM is ready
    const timeout = setTimeout(focusInput, 100);
    return () => clearTimeout(timeout);
  }, [disabled]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        ref={inputRef}
        className="w-full p-3 pr-12 bg-[#f3ebad]/10 border border-[#f3ebad]/20 rounded-md text-[#f3ebad] placeholder:text-[#f3ebad]/50 outline-none focus:border-[#f3ebad]/50 transition-colors resize-none"
        placeholder={disabled ? "Chargement en cours..." : "Votre message..."}
        rows={2}
        value={internalNewMessage}
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
