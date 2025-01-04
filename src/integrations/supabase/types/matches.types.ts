export interface MatchesTable {
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
  Relationships: [];
}