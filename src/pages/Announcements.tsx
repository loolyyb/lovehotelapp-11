
import { AnnouncementsList } from "@/components/announcements/AnnouncementsList";
import { AnnouncementForm } from "@/components/announcements/AnnouncementForm";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { Loader } from "lucide-react";

export default function Announcements() {
  const { 
    announcements, 
    loading, 
    handleSubmitAnnouncement,
    handleUpdateAnnouncement,
    handleDeleteAnnouncement,
    handleReaction,
    handleComment,
    session 
  } = useAnnouncements();

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(135deg,#1E1E1E_0%,#CD0067_100%)]">
        <div className="max-w-3xl mx-auto px-4 py-8 flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#1E1E1E_0%,#CD0067_100%)]">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <AnnouncementForm onSubmit={handleSubmitAnnouncement} />
        {Array.isArray(announcements) ? (
          <AnnouncementsList 
            announcements={announcements}
            onReact={handleReaction}
            onComment={handleComment}
            onEdit={handleUpdateAnnouncement}
            onDelete={handleDeleteAnnouncement}
            session={session}
          />
        ) : (
          <div className="text-white text-center">Aucune annonce disponible</div>
        )}
      </div>
    </div>
  );
}
