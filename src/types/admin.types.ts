
export interface AdminUser {
  id: string;
  full_name: string | null;
  user_id: string | null;
  email: string | null;
  role: "user" | "moderator" | "admin";
  created_at: string;
  account_status: string;
  is_love_hotel_member: boolean;
}

export interface AdminStats {
  users: AdminUser[];
  messages: any[];
  events: any[];
  conversations: any[];
  profiles: any[];
}
