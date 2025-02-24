
import { useState } from "react";
import { AdminAnnouncement } from "./types";
import { AnnouncementsTable } from "./components/AnnouncementsTable";
import { EditAnnouncementDialog } from "./components/EditAnnouncementDialog";
import { DeleteAnnouncementDialog } from "./components/DeleteAnnouncementDialog";
import { useAnnouncementsManagement } from "./hooks/useAnnouncementsManagement";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function AnnouncementsManager() {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AdminAnnouncement | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    announcements = [],
    isLoading,
    updateAnnouncement,
    deleteAnnouncement,
  } = useAnnouncementsManagement();

  const handleEdit = (announcement: AdminAnnouncement) => {
    setSelectedAnnouncement(announcement);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (announcement: AdminAnnouncement) => {
    setSelectedAnnouncement(announcement);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateAnnouncement = async (data: { content: string; image?: File | null }) => {
    if (!selectedAnnouncement) return;

    let imageUrl = selectedAnnouncement.image_url;

    if (data.image) {
      const fileExt = data.image.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('announcements')
        .upload(filePath, data.image);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('announcements')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
      }
    }

    updateAnnouncement({
      id: selectedAnnouncement.id,
      content: data.content,
      imageUrl: data.image === null ? null : imageUrl,
    });
    setIsEditDialogOpen(false);
  };

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAnnouncements = filteredAnnouncements.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Rechercher une publication..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      <AnnouncementsTable
        announcements={currentAnnouncements}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <EditAnnouncementDialog
        announcement={selectedAnnouncement}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateAnnouncement}
      />

      <DeleteAnnouncementDialog
        announcement={selectedAnnouncement}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={deleteAnnouncement}
      />
    </div>
  );
}
