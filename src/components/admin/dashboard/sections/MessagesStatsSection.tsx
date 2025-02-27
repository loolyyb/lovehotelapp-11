
import { AdminStats } from "@/types/admin.types";
import { MessageSquareIcon, MessageCircleIcon, TrendingUpIcon } from "lucide-react";
import { StatCard } from "../components/StatCard";

interface MessagesStatsSectionProps {
  stats: Partial<AdminStats>;
  messageData: any[];
  activeConversationsCount: number;
  totalMessagesCount: number;
}

export function MessagesStatsSection({ 
  stats, 
  messageData, 
  activeConversationsCount,
  totalMessagesCount
}: MessagesStatsSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-cormorant font-semibold mb-4 text-[#f3ebad]">Statistiques Messages</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={MessageSquareIcon}
          title="Messages Aujourd'hui"
          value={stats.messages?.filter(m => new Date(m.created_at).toDateString() === new Date().toDateString()).length || 0}
          chartData={messageData}
          bgClass="bg-gradient-to-br from-[#40192C] to-[#CE0067]/50"
        />
        <StatCard
          icon={MessageCircleIcon}
          title="Total Conversations"
          value={stats.conversations?.length || 0}
        />
        <StatCard
          icon={MessageCircleIcon}
          title="Conversations Actives"
          value={activeConversationsCount}
          trend={`${Math.round((activeConversationsCount / (stats.conversations?.length || 1)) * 100)}% du total`}
        />
        <StatCard
          icon={TrendingUpIcon}
          title="Total Messages"
          value={totalMessagesCount}
          bgClass="bg-gradient-to-br from-[#CE0067]/70 to-[#40192C]"
        />
      </div>
    </div>
  );
}
