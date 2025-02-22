
import { useAuthSession } from "@/hooks/useAuthSession";
import { useAnnouncementReactions } from "./hooks/useAnnouncementReactions";
import { useAnnouncementComments } from "./hooks/useAnnouncementComments";
import { useAnnouncementDeletion } from "./hooks/useAnnouncementDeletion";
import { AnnouncementHeader } from "./components/AnnouncementHeader";
import { AnnouncementContent } from "./components/AnnouncementContent";
import { AnnouncementReactions } from "./components/AnnouncementReactions";
import { AnnouncementComments } from "./components/AnnouncementComments";
import { DeleteAnnouncementDialog } from "./components/DeleteAnnouncementDialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AnnouncementProps {
  announcement: {
    id: string;
    content: string;
    image_url: string | null;
    created_at: string;
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function Announcement({
  announcement
}: AnnouncementProps) {
  const { session } = useAuthSession();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<Array<{
    id: string;
    image_url: string;
  }>>([]);

  const {
    reactions,
    userReaction,
    handleReaction
  } = useAnnouncementReactions(announcement.id, session);

  const {
    comments,
    isLoadingComments,
    showComments,
    loadComments,
    handleComment
  } = useAnnouncementComments(announcement.id, session);

  const {
    isDeleting,
    handleDelete
  } = useAnnouncementDeletion();

  useEffect(() => {
    const fetchAdditionalImages = async () => {
      const { data, error } = await supabase
        .from('announcement_images')
        .select('id, image_url')
        .eq('announcement_id', announcement.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setAdditionalImages(data);
      }
    };

    fetchAdditionalImages();
  }, [announcement.id]);

  const isOwner = session?.user?.id === announcement.user_id;

  const handleDeleteConfirm = async () => {
    if (!session?.user) return;
    
    const success = await handleDelete(announcement.id, announcement.user_id);
    if (success) {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="bg-background/95 border border-burgundy/20 rounded-lg p-6 space-y-4 shadow-lg">
      <div className="flex items-start justify-between w-full">
        <div className="flex-grow">
          <AnnouncementHeader 
            full_name={announcement.full_name} 
            avatar_url={announcement.avatar_url} 
            createdAt={announcement.created_at} 
          />
        </div>
        {isOwner && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-zinc-400 hover:text-red-500 transition-colors"
            disabled={isDeleting}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <AnnouncementContent 
        content={announcement.content} 
        imageUrl={announcement.image_url} 
        additionalImages={additionalImages} 
      />

      <AnnouncementReactions 
        reactions={reactions} 
        userReaction={userReaction} 
        commentsCount={comments.length} 
        onReaction={handleReaction} 
        onCommentClick={loadComments} 
      />

      {showComments && (
        <div className="space-y-4 pt-4 border-t border-burgundy/10">
          <AnnouncementComments 
            comments={comments} 
            isLoading={isLoadingComments} 
            onSubmitComment={handleComment} 
          />
        </div>
      )}

      <DeleteAnnouncementDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)} 
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
