import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Send, Smile } from "lucide-react";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  onSend: (e: React.FormEvent) => void;
  conversationId: string;
}

export function MessageInput({ newMessage, setNewMessage, onSend, conversationId }: MessageInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${conversationId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('message_media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('message_media')
        .getPublicUrl(filePath);

      setNewMessage(`[Image](${publicUrl})`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'uploader l'image",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onEmojiSelect = (emoji: any) => {
    setNewMessage(prev => prev + emoji.native);
  };

  return (
    <form onSubmit={onSend} className="p-4 border-t border-rose/20 bg-white/95 backdrop-blur-sm">
      <div className="flex space-x-2 items-center">
        <div className="flex-1 flex space-x-2 items-center">
          <label className="cursor-pointer flex-shrink-0">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploading}
            />
            <Image className="h-6 w-6 text-gray-500 hover:text-burgundy transition-colors" />
          </label>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0 flex-shrink-0">
                <Smile className="h-6 w-6 text-gray-500 hover:text-burgundy transition-colors" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 border-none">
              <Picker data={data} onEmojiSelect={onEmojiSelect} />
            </PopoverContent>
          </Popover>

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1"
          />
        </div>
        <Button 
          type="submit" 
          disabled={!newMessage.trim() || isUploading}
          className="flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}