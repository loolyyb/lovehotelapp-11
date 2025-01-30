export type EventType = "bdsm" | "jacuzzi" | "gastronomy" | "speed_dating" | "other";

export interface EventParticipant {
  id: string;
  user_id: string;
  status: string;
  profiles?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_type: EventType;
  event_date: string;
  max_participants?: number;
  location?: string;
  price?: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_private: boolean;
  free_for_members: boolean;
  image_url?: string;
  event_participants?: EventParticipant[];
}