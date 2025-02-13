
export interface NotificationsTable {
  Row: {
    id: string;
    title: string;
    content: string;
    type: string;
    link_url: string | null;
    image_url: string | null;
    is_read: boolean | null;
    user_id: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    title: string;
    content: string;
    type: string;
    link_url?: string | null;
    image_url?: string | null;
    is_read?: boolean | null;
    user_id?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    title?: string;
    content?: string;
    type?: string;
    link_url?: string | null;
    image_url?: string | null;
    is_read?: boolean | null;
    user_id?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "notifications_user_id_fkey";
      columns: ["user_id"];
      isOneToOne: false;
      referencedRelation: "users";
      referencedColumns: ["id"];
    }
  ];
}
