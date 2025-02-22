
import { Database } from "@/integrations/supabase/types/database.types";

export type AnnouncementWithRelations = Database['public']['Tables']['announcements']['Row'] & {
  user: {
    full_name: string;
    avatar_url?: string;
  };
  reactions: Array<{
    type: string;
    user_id: string;
  }>;
  comments: Array<{
    id: string;
  }>;
};
