
import { AnnouncementCard } from "./AnnouncementCard";
import type { AnnouncementWithRelations } from "@/types/announcements.types";
import { Session } from "@supabase/supabase-js";

interface AnnouncementsListProps {
  announcements: AnnouncementWithRelations[];
  onReact: (announcementId: string, type: string) => void;
  onComment: (announcementId: string, content: string) => Promise<void>;
  onEdit: (id: string, content: string, imageUrl?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  session: Session | null;
}

export function AnnouncementsList({ 
  announcements, 
  onReact, 
  onComment,
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
          onComment={(content) => onComment(announcement.id, content)}
          onEdit={(content, imageUrl) => onEdit(announcement.id, content, imageUrl)}
          onDelete={() => onDelete(announcement.id)}
          reactions={Object.entries(
            announcement.reactions.reduce((acc: Record<string, number>, r) => {
              acc[r.type] = (acc[r.type] || 0) + 1;
              return acc;
            }, {})
          ).map(([type, count]) => ({ type, count: Number(count) }))}
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
