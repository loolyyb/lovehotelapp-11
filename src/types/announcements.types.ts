
export type AnnouncementUser = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
};

export type AnnouncementComment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: AnnouncementUser;
};

export type AnnouncementWithRelations = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  user: AnnouncementUser;
  reactions: Array<{
    reaction_type: string;
    user_id: string;
  }>;
  comments: AnnouncementComment[];
};
