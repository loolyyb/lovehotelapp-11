
import { useAuthSession } from "@/hooks/useAuthSession";
import { useAnnouncementReactions } from "./hooks/useAnnouncementReactions";
import { useAnnouncementComments } from "./hooks/useAnnouncementComments";
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

export function Announcement({ announcement }: AnnouncementProps) {
  const { session } = useAuthSession();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<Array<{ id: string; image_url: string; }>>([]);

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

  const isOwner = session?.user.id === announcement.user_id;

  const handleDelete = async () => {
    if (!session?.user) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcement.id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      toast({
        title: "Annonce supprimée",
        description: "Votre annonce a été supprimée avec succès"
      });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'annonce"
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="backdrop-blur-sm border border-burgundy/20 rounded-lg p-6 space-y-4 bg-[#40192c]">
      <div className="flex justify-between items-start">
        <AnnouncementHeader
          profileName={announcement.full_name || 'Utilisateur inconnu'}
          avatarUrl={announcement.avatar_url}
          createdAt={announcement.created_at}
        />
        {isOwner && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-zinc-400 hover:text-red-500"
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
        onConfirm={handleDelete}
      />
    </div>
  );
}
