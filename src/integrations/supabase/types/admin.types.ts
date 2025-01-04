export interface AdminSettingsTable {
  Row: {
    id: string;
    key: string;
    value: {
      version?: string;
      current?: string;
      available?: string[];
    };
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    key: string;
    value: {
      version?: string;
      current?: string;
      available?: string[];
    };
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    key?: string;
    value?: {
      version?: string;
      current?: string;
      available?: string[];
    };
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [];
}