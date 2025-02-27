
import { AdminStats } from "@/types/admin.types";
import { UsersStatsSection } from "./sections/UsersStatsSection";
import { MessagesStatsSection } from "./sections/MessagesStatsSection";
import { EventsStatsSection } from "./sections/EventsStatsSection";
import { ActivityStatsSection } from "./sections/ActivityStatsSection";
import { prepareMessageData, calculateActiveConversations, calculateTotalMessages } from "./utils/statsUtils";

export function StatsContent({ stats }: { stats: Partial<AdminStats> }) {
  // Préparer les données et calculer les statistiques
  const messageData = prepareMessageData(stats.messages);
  const activeConversationsCount = calculateActiveConversations(stats);
  const totalMessagesCount = calculateTotalMessages(stats.messages);

  // Vérification supplémentaire pour le débogage
  console.log("Stats messages:", stats.messages);
  console.log("Total messages count:", totalMessagesCount);

  return (
    <div className="space-y-8 p-6">
      {/* Section Utilisateurs */}
      <UsersStatsSection stats={stats} />

      {/* Section Messages */}
      <MessagesStatsSection 
        stats={stats} 
        messageData={messageData} 
        activeConversationsCount={activeConversationsCount}
        totalMessagesCount={totalMessagesCount}
      />

      {/* Section Événements */}
      <EventsStatsSection stats={stats} />

      {/* Section Activité */}
      <ActivityStatsSection stats={stats} />
    </div>
  );
}
