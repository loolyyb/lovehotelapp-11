
export interface AdminUser {
  id: string;
  user_id: string | null;
  email?: string | null;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  description: string | null;
  role: "user" | "moderator" | "admin";
  account_status: string;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  admin_notes: string | null;
  location: string | null;
  is_love_hotel_member: boolean;
  is_loolyb_holder: boolean;
  loolyb_tokens: number;
  loyalty_points: number;
  photo_urls: string[];
  relationship_type: string[];
  seeking: string[];
  sexual_orientation: string | null;
  status: string | null;
  visibility: string;
  allowed_viewers: string[];
}

export interface AdminStats {
  users: AdminUser[];
  messages: any[];
  events: any[];
  conversations: any[];
  profiles: any[];
}
