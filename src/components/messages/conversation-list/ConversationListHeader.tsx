
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConversationListHeaderProps {
  isRefreshing: boolean;
  handleRefresh: () => void;
}

export function ConversationListHeader({
  isRefreshing,
  handleRefresh
}: ConversationListHeaderProps) {
  return (
    <div className="p-4 border-b border-rose/20">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-burgundy text-[#f3ebad]">Messages</h2>
        <div className="flex items-center">
          {isRefreshing && (
            <span className="text-xs text-[#f3ebad]/50 mr-2">Actualisation...</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-[#f3ebad]/70 hover:text-[#f3ebad] hover:bg-[#f3ebad]/5"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  );
}
