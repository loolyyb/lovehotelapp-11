
import { AdminUser } from "@/types/admin.types";

export interface EditUserFormData {
  full_name: string;
  role: "user" | "moderator" | "admin";
  account_status: string;
}

export interface UsersManagerProps {
  users?: AdminUser[];
  searchTerm: string;
}

export interface UsersTableProps {
  users: AdminUser[];
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

export interface EditUserDialogProps {
  user: AdminUser | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EditUserFormData) => void;
}

export interface DeleteUserDialogProps {
  user: AdminUser | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (userId: string) => void;
}
