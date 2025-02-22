
import { AnnouncementCard } from "./AnnouncementCard";
import type { AnnouncementWithRelations } from "@/hooks/useAnnouncements";
import { Session } from "@supabase/supabase-js";

interface AnnouncementsListProps {
  announcements: AnnouncementWithRelations[];
  onReact: (announcementId: string, type: string) => void;
  onEdit: (id: string, content: string, imageUrl?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  session: Session | null;
}

export function AnnouncementsList({ 
  announcements, 
  onReact, 
  onEdit,
  onDelete,
  session 
}: AnnouncementsListProps) {
  return (
    <div className="space-y-6">
      {announcements.map((announcement) => (
        <AnnouncementCard
          key={announcement.id}
          announcement={announcement}
          onReact={(type) => onReact(announcement.id, type)}
          onEdit={onEdit}
          onDelete={onDelete}
          onComment={() => {}} // À implémenter dans la prochaine étape
          reactions={Object.entries(
            announcement.reactions.reduce((acc: Record<string, number>, r) => {
              acc[r.type] = (acc[r.type] || 0) + 1;
              return acc;
            }, {})
          ).map(([type, count]) => ({ type, count }))}
          commentCount={announcement.comments.length}
          userReaction={
            announcement.reactions.find(
              (r) => r.user_id === session?.user?.id
            )?.type
          }
          currentUserId={session?.user?.id}
        />
      ))}
    </div>
  );
}
