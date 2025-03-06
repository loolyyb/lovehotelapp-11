
import { MatchesTable } from './matches.types';
import { PreferencesTable } from './preferences.types';
import { ProfilesTable } from './profiles.types';
import { AdminSettingsTable } from './admin.types';
import { NotificationsTable } from './notifications.types';

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
      admin_settings: AdminSettingsTable;
      notifications: NotificationsTable;
      conversations: {
        Row: {
          id: string;
          user1_id: string;
          user2_id: string;
          created_at: string;
          updated_at: string;
          status?: string;
          blocked_by?: string | null;
        };
        Insert: {
          id?: string;
          user1_id: string;
          user2_id: string;
          created_at?: string;
          updated_at?: string;
          status?: string;
          blocked_by?: string | null;
        };
        Update: {
          id?: string;
          user1_id?: string;
          user2_id?: string;
          created_at?: string;
          updated_at?: string;
          status?: string;
          blocked_by?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string | null;
          created_at: string;
          read_at: string | null;
          deleted_at: string | null;
          media_url: string | null;
          media_type: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content?: string | null;
          created_at?: string;
          read_at?: string | null;
          deleted_at?: string | null;
          media_url?: string | null;
          media_type?: string | null;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string | null;
          created_at?: string;
          read_at?: string | null;
          deleted_at?: string | null;
          media_url?: string | null;
          media_type?: string | null;
        };
      };
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
