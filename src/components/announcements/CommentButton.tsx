
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface CommentButtonProps {
  count: number;
  onClick: () => void;
  disabled: boolean;
}

export function CommentButton({ count, onClick, disabled }: CommentButtonProps) {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="text-gray-700 hover:text-[#ce0067]"
      disabled={disabled}
      onClick={onClick}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      <span>{count}</span>
    </Button>
  );
}
