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