import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface MessageHeaderProps {
  otherUser: any;
  onBack: () => void;
}

export function MessageHeader({ otherUser, onBack }: MessageHeaderProps) {
  return (
    <div className="p-4 border-b border-rose/20 flex items-center space-x-4">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onBack}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Avatar className="h-10 w-10">
        <AvatarImage src={otherUser?.avatar_url} />
        <AvatarFallback>{otherUser?.full_name?.[0] || '?'}</AvatarFallback>
      </Avatar>
      <div>
        <h2 className="font-semibold">{otherUser?.full_name}</h2>
      </div>
    </div>
  );
}