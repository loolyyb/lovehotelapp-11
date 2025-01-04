export interface ProfilesTable {
  Row: {
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
    description: string | null;
    full_name: string | null;
    id: string;
    is_loolyb_holder: boolean | null;
    is_love_hotel_member: boolean | null;
    photo_urls: string[] | null;
    relationship_type: "casual" | "serious" | "libertine" | null;
    seeking: string[] | null;
    sexual_orientation: string | null;
    status: string | null;
    updated_at: string;
    user_id: string | null;
    username: string | null;
  };
  Insert: {
    avatar_url?: string | null;
    bio?: string | null;
    created_at?: string;
    description?: string | null;
    full_name?: string | null;
    id?: string;
    is_loolyb_holder?: boolean | null;
    is_love_hotel_member?: boolean | null;
    photo_urls?: string[] | null;
    relationship_type?: "casual" | "serious" | "libertine" | null;
    seeking?: string[] | null;
    sexual_orientation?: string | null;
    status?: string | null;
    updated_at?: string;
    user_id?: string | null;
    username?: string | null;
  };
  Update: {
    avatar_url?: string | null;
    bio?: string | null;
    created_at?: string;
    description?: string | null;
    full_name?: string | null;
    id?: string;
    is_loolyb_holder?: boolean | null;
    is_love_hotel_member?: boolean | null;
    photo_urls?: string[] | null;
    relationship_type?: "casual" | "serious" | "libertine" | null;
    seeking?: string[] | null;
    sexual_orientation?: string | null;
    status?: string | null;
    updated_at?: string;
    user_id?: string | null;
    username?: string | null;
  };
  Relationships: [];
}