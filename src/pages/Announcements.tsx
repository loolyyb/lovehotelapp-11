import { AnnouncementsList } from "@/components/announcements/AnnouncementsList";
import { CreateAnnouncementForm } from "@/components/announcements/CreateAnnouncementForm";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Loader } from "lucide-react";
export default function Announcements() {
  const {
    session,
    loading
  } = useAuthSession();

  // Pendant le chargement, afficher un indicateur de chargement
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-burgundy" />
      </div>;
  }

  // Une fois le chargement terminé, vérifier la session
  if (!session) {
    window.location.href = '/login';
    return null;
  }
  return <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-burgundy mb-2 text-[#f3ebad]">Annonces</h1>
        <p className="text-gray-600">Partagez vos annonces avec la communauté</p>
      </div>
      
      <div className="space-y-8">
        <CreateAnnouncementForm />
        <AnnouncementsList />
      </div>
    </div>;
}