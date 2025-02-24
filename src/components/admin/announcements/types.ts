
import { AdminUser } from "@/types/admin.types";

export interface AdminAnnouncement {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string | null;
  user_id: string;
  user?: {
    full_name: string | null;
    email: string | null;
  };
}

export interface AnnouncementsManagerProps {
  searchTerm?: string;
}

export interface AnnouncementsTableProps {
  announcements: AdminAnnouncement[];
  onEdit: (announcement: AdminAnnouncement) => void;
  onDelete: (announcement: AdminAnnouncement) => void;
}

export interface EditAnnouncementDialogProps {
  announcement: AdminAnnouncement | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { content: string; image?: File | null }) => void;
}

export interface DeleteAnnouncementDialogProps {
  announcement: AdminAnnouncement | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (announcementId: string) => void;
}
