
export interface PushSubscriptionsTable {
  Row: {
    id: string;
    user_id: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    endpoint?: string;
    p256dh?: string;
    auth?: string;
    created_at?: string;
    updated_at?: string;
  };
}

export interface PushNotificationsTable {
  Row: {
    id: string;
    title: string;
    message: string;
    icon_url: string | null;
    target_url: string | null;
    target_motivation: string | null;
    status: 'pending' | 'sent' | 'failed';
    created_by: string | null;
    created_at: string;
    sent_at: string | null;
    error_message: string | null;
  };
  Insert: {
    id?: string;
    title: string;
    message: string;
    icon_url?: string | null;
    target_url?: string | null;
    target_motivation?: string | null;
    status?: 'pending' | 'sent' | 'failed';
    created_by?: string | null;
    created_at?: string;
    sent_at?: string | null;
    error_message?: string | null;
  };
  Update: {
    id?: string;
    title?: string;
    message?: string;
    icon_url?: string | null;
    target_url?: string | null;
    target_motivation?: string | null;
    status?: 'pending' | 'sent' | 'failed';
    created_by?: string | null;
    created_at?: string;
    sent_at?: string | null;
    error_message?: string | null;
  };
}
