import { useAuthSession } from "@/hooks/useAuthSession";
import { useAnnouncementReactions } from "./hooks/useAnnouncementReactions";
import { useAnnouncementComments } from "./hooks/useAnnouncementComments";
import { AnnouncementHeader } from "./components/AnnouncementHeader";
import { AnnouncementContent } from "./components/AnnouncementContent";
import { AnnouncementReactions } from "./components/AnnouncementReactions";
import { AnnouncementComments } from "./components/AnnouncementComments";
interface AnnouncementProps {
  announcement: {
    id: string;
    content: string;
    image_url: string | null;
    created_at: string;
    user_id: string;
    profiles: {
      full_name: string;
      avatar_url: string | null;
    } | null;
  };
}
export function Announcement({
  announcement
}: AnnouncementProps) {
  const {
    session
  } = useAuthSession();
  const {
    reactions,
    userReaction,
    handleReaction
  } = useAnnouncementReactions(announcement.id, session);
  const {
    comments,
    isLoadingComments,
    showComments,
    loadComments,
    handleComment
  } = useAnnouncementComments(announcement.id, session);
  return <div className="backdrop-blur-sm border border-burgundy/20 rounded-lg p-6 space-y-4 bg-[#40192c]">
      <AnnouncementHeader profileName={announcement.profiles?.full_name || ''} avatarUrl={announcement.profiles?.avatar_url} createdAt={announcement.created_at} />
      
      <AnnouncementContent content={announcement.content} imageUrl={announcement.image_url} />

      <AnnouncementReactions reactions={reactions} userReaction={userReaction} commentsCount={comments.length} onReaction={handleReaction} onCommentClick={loadComments} />

      {showComments && <div className="space-y-4 pt-4 border-t border-burgundy/10">
          <AnnouncementComments comments={comments} isLoading={isLoadingComments} onSubmitComment={handleComment} />
        </div>}
    </div>;
}