export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      matches: MatchesTable;
      preferences: PreferencesTable;
      profiles: ProfilesTable;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

interface MatchesTable {
  Row: {
    created_at: string;
    id: string;
    status: string | null;
    updated_at: string;
    user1_id: string | null;
    user2_id: string | null;
  };
  Insert: {
    created_at?: string;
    id?: string;
    status?: string | null;
    updated_at?: string;
    user1_id?: string | null;
    user2_id?: string | null;
  };
  Update: {
    created_at?: string;
    id?: string;
    status?: string | null;
    updated_at?: string;
    user1_id?: string | null;
    user2_id?: string | null;
  };
}

interface PreferencesTable {
  Row: {
    created_at: string;
    id: string;
    interests: string[] | null;
    location: string | null;
    max_age: number | null;
    min_age: number | null;
    updated_at: string;
    user_id: string | null;
  };
  Insert: {
    created_at?: string;
    id?: string;
    interests?: string[] | null;
    location?: string | null;
    max_age?: number | null;
    min_age?: number | null;
    updated_at?: string;
    user_id?: string | null;
  };
  Update: {
    created_at?: string;
    id?: string;
    interests?: string[] | null;
    location?: string | null;
    max_age?: number | null;
    min_age?: number | null;
    updated_at?: string;
    user_id?: string | null;
  };
}

interface ProfilesTable {
  Row: {
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
    description: string | null;
    full_name: string | null;
    id: string;
    is_loolyb_holder: boolean | null;
    is_love_hotel_member: boolean | null;
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
    seeking?: string[] | null;
    sexual_orientation?: string | null;
    status?: string | null;
    updated_at?: string;
    user_id?: string | null;
    username?: string | null;
  };
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;