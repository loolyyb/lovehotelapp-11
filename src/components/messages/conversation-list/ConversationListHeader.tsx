
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface ConversationListHeaderProps {
  isRefreshing: boolean;
  handleRefresh: () => void;
}

export function ConversationListHeader({
  isRefreshing,
  handleRefresh
}: ConversationListHeaderProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isAnimating) {
      timeoutId = setTimeout(() => {
        setIsAnimating(false);
      }, 3000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isAnimating]);

  const handleClick = () => {
    setIsAnimating(true);
    handleRefresh();
  };

  return (
    <div className="p-4 border-b border-rose/20">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-burgundy text-[#f3ebad]">Messages</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClick}
          disabled={isRefreshing}
          className="text-[#f3ebad]/70 hover:text-[#f3ebad] hover:bg-[#f3ebad]/5"
        >
          <RefreshCw className={`h-4 w-4 ${isAnimating ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
}
