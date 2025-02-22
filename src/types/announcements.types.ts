
import { Database } from "@/integrations/supabase/types/database.types";

export type AnnouncementComment = {
  id: string;
  content: string;
  created_at: string;
  user: {
    full_name: string | null;
    avatar_url: string | null;
  };
};

export type AnnouncementWithRelations = Database['public']['Tables']['announcements']['Row'] & {
  user: {
    full_name: string | null;
    avatar_url: string | null;
  };
  reactions: Array<{
    type: string;
    user_id: string;
  }>;
  comments: AnnouncementComment[];
};
