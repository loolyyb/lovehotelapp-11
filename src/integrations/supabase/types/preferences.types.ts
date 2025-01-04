export interface PreferencesTable {
  Row: {
    created_at: string;
    id: string;
    interests: string[] | null;
    location: string | null;
    max_age: number | null;
    min_age: number | null;
    open_curtains: boolean | null;
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
    open_curtains?: boolean | null;
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
    open_curtains?: boolean | null;
    updated_at?: string;
    user_id?: string | null;
  };
  Relationships: [];
}