export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      advertisements: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          format: string
          id: string
          image_url: string | null
          link_url: string | null
          location: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          format: string
          id?: string
          image_url?: string | null
          link_url?: string | null
          location: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          format?: string
          id?: string
          image_url?: string | null
          link_url?: string | null
          location?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      application_logs: {
        Row: {
          context: Json | null
          id: string
          level: string
          message: string
          route: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          id?: string
          level: string
          message: string
          route?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          id?: string
          level?: string
          message?: string
          route?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      challenge_participations: {
        Row: {
          challenge_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          points_earned: number | null
          proof_urls: string[] | null
          status: string | null
          updated_at: string
          user1_id: string | null
          user2_id: string | null
        }
        Insert: {
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          points_earned?: number | null
          proof_urls?: string[] | null
          status?: string | null
          updated_at?: string
          user1_id?: string | null
          user2_id?: string | null
        }
        Update: {
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          points_earned?: number | null
          proof_urls?: string[] | null
          status?: string | null
          updated_at?: string
          user1_id?: string | null
          user2_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participations_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          challenge_type: Database["public"]["Enums"]["challenge_type"]
          created_at: string
          description: string | null
          duration: unknown | null
          id: string
          points: number | null
          requirements: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          challenge_type: Database["public"]["Enums"]["challenge_type"]
          created_at?: string
          description?: string | null
          duration?: unknown | null
          id?: string
          points?: number | null
          requirements?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          challenge_type?: Database["public"]["Enums"]["challenge_type"]
          created_at?: string
          description?: string | null
          duration?: unknown | null
          id?: string
          points?: number | null
          requirements?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          blocked_by: string | null
          created_at: string
          id: string
          status: string | null
          updated_at: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          blocked_by?: string | null
          created_at?: string
          id?: string
          status?: string | null
          updated_at?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          blocked_by?: string | null
          created_at?: string
          id?: string
          status?: string | null
          updated_at?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user1_profile_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user2_profile_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          event_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          location: string | null
          max_participants: number | null
          price: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          event_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          location?: string | null
          max_participants?: number | null
          price?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          event_date?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          location?: string | null
          max_participants?: number | null
          price?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      group_event_participants: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "group_events"
            referencedColumns: ["id"]
          },
        ]
      }
      group_events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string
          group_id: string | null
          id: string
          is_private: boolean | null
          location: string | null
          max_participants: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date: string
          group_id?: string | null
          id?: string
          is_private?: boolean | null
          location?: string | null
          max_participants?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string
          group_id?: string | null
          id?: string
          is_private?: boolean | null
          location?: string | null
          max_participants?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string | null
          id: string
          joined_at: string
          role: string | null
          user_id: string | null
        }
        Insert: {
          group_id?: string | null
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string | null
        }
        Update: {
          group_id?: string | null
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_posts: {
        Row: {
          content: string
          created_at: string
          group_id: string | null
          id: string
          media_url: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          group_id?: string | null
          id?: string
          media_url?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string | null
          id?: string
          media_url?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          group_type: Database["public"]["Enums"]["group_type"]
          id: string
          is_private: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          group_type: Database["public"]["Enums"]["group_type"]
          id?: string
          is_private?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          group_type?: Database["public"]["Enums"]["group_type"]
          id?: string
          is_private?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      live_streams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          room_number: string | null
          stream_type: Database["public"]["Enums"]["stream_type"]
          streamer_id: string
          title: string | null
          updated_at: string
          viewer_count: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          room_number?: string | null
          stream_type: Database["public"]["Enums"]["stream_type"]
          streamer_id: string
          title?: string | null
          updated_at?: string
          viewer_count?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          room_number?: string | null
          stream_type?: Database["public"]["Enums"]["stream_type"]
          streamer_id?: string
          title?: string | null
          updated_at?: string
          viewer_count?: number | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          status: string | null
          updated_at: string
          user1_id: string | null
          user2_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string | null
          updated_at?: string
          user1_id?: string | null
          user2_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          status?: string | null
          updated_at?: string
          user1_id?: string | null
          user2_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          deleted_at: string | null
          id: string
          media_type: string | null
          media_url: string | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_read: boolean | null
          link_url: string | null
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          link_url?: string | null
          title: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          link_url?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      preferences: {
        Row: {
          created_at: string
          id: string
          interests: Database["public"]["Enums"]["interest_type"][] | null
          libertine_party_interest: boolean | null
          location: string | null
          max_age: number | null
          min_age: number | null
          open_curtains: boolean | null
          open_curtains_interest: boolean | null
          speed_dating_interest: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          interests?: Database["public"]["Enums"]["interest_type"][] | null
          libertine_party_interest?: boolean | null
          location?: string | null
          max_age?: number | null
          min_age?: number | null
          open_curtains?: boolean | null
          open_curtains_interest?: boolean | null
          speed_dating_interest?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          interests?: Database["public"]["Enums"]["interest_type"][] | null
          libertine_party_interest?: boolean | null
          location?: string | null
          max_age?: number | null
          min_age?: number | null
          open_curtains?: boolean | null
          open_curtains_interest?: boolean | null
          speed_dating_interest?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allowed_viewers: string[] | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          description: string | null
          full_name: string | null
          id: string
          is_loolyb_holder: boolean | null
          is_love_hotel_member: boolean | null
          loolyb_tokens: number | null
          loyalty_points: number | null
          photo_urls: string[] | null
          relationship_type: string[] | null
          seeking: string[] | null
          sexual_orientation: string | null
          status: string | null
          updated_at: string
          user_id: string | null
          username: string | null
          visibility: string
        }
        Insert: {
          allowed_viewers?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          description?: string | null
          full_name?: string | null
          id?: string
          is_loolyb_holder?: boolean | null
          is_love_hotel_member?: boolean | null
          loolyb_tokens?: number | null
          loyalty_points?: number | null
          photo_urls?: string[] | null
          relationship_type?: string[] | null
          seeking?: string[] | null
          sexual_orientation?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
          visibility?: string
        }
        Update: {
          allowed_viewers?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          description?: string | null
          full_name?: string | null
          id?: string
          is_loolyb_holder?: boolean | null
          is_love_hotel_member?: boolean | null
          loolyb_tokens?: number | null
          loyalty_points?: number | null
          photo_urls?: string[] | null
          relationship_type?: string[] | null
          seeking?: string[] | null
          sexual_orientation?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
          visibility?: string
        }
        Relationships: []
      }
      stream_viewers: {
        Row: {
          id: string
          joined_at: string
          stream_id: string
          viewer_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          stream_id: string
          viewer_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          stream_id?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_viewers_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_demo_user: {
        Args: {
          email: string
          password: string
          full_name: string
        }
        Returns: string
      }
    }
    Enums: {
      challenge_type: "quiz" | "puzzle" | "photo" | "activity"
      event_type: "bdsm" | "jacuzzi" | "gastronomy" | "other"
      group_type: "bdsm" | "libertins" | "rideaux_ouverts" | "other"
      interest_type:
        | "bdsm"
        | "jacuzzi"
        | "gastronomie"
        | "rideaux_ouverts"
        | "speed_dating"
        | "libertinage"
        | "art"
      stream_type: "video" | "audio"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
