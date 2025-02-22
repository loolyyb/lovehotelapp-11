
export type AnnouncementComment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
};

export type AnnouncementWithRelations = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  reactions: Array<{
    type: string;
    user_id: string;
  }>;
  comments: AnnouncementComment[];
};
