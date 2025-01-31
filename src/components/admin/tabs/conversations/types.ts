export interface MessageWithProfiles {
  id: string;
  content: string | null;
  created_at: string;
  read_at: string | null;
  sender_id: string;
  conversation_id: string;
  sender: {
    full_name: string | null;
    username: string | null;
  } | null;
  conversation: {
    user1: {
      full_name: string | null;
      username: string | null;
    } | null;
    user2: {
      full_name: string | null;
      username: string | null;
    } | null;
  } | null;
}