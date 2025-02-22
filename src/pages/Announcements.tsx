
import { Announcement } from "@/components/announcements/Announcement";
import { AnnouncementsList } from "@/components/announcements/AnnouncementsList";
import { CreateAnnouncementForm } from "@/components/announcements/CreateAnnouncementForm";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Navigate } from "react-router-dom";

export default function Announcements() {
  const { session } = useAuthSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-burgundy mb-2">Annonces</h1>
        <p className="text-gray-600">Partagez vos annonces avec la communauté</p>
      </div>
      
      <div className="space-y-8">
        <CreateAnnouncementForm />
        <AnnouncementsList />
      </div>
    </div>
  );
}
