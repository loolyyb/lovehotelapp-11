
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { type AnnouncementWithRelations } from "@/types/announcements.types";
import { AnnouncementHeader } from "./AnnouncementHeader";
import { AnnouncementReactions } from "./AnnouncementReactions";
import { CommentButton } from "./CommentButton";
import { CommentsList } from "./CommentsList";
import { CommentForm } from "./CommentForm";
import { EditAnnouncementForm } from "./EditAnnouncementForm";

interface AnnouncementCardProps {
  announcement: AnnouncementWithRelations;
  onReact: (type: string) => void;
  onComment: (content: string) => Promise<void>;
  onEdit: (content: string, imageUrl?: string) => Promise<void>;
  onDelete: () => Promise<void>;
  reactions: {
    reaction_type: string;
    count: number;
  }[];
  commentCount: number;
  userReaction?: string;
  currentUserId?: string;
}

export function AnnouncementCard({
  announcement,
  onReact,
  onComment,
  onEdit,
  onDelete,
  reactions,
  commentCount,
  userReaction,
  currentUserId
}: AnnouncementCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isOwner = Boolean(currentUserId && currentUserId === announcement.user_id);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await onDelete();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (content: string, imageUrl?: string) => {
    try {
      setIsLoading(true);
      await onEdit(content, imageUrl);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full bg-white shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <AnnouncementHeader
          user={announcement.user}
          createdAt={announcement.created_at}
          isOwner={isOwner}
          onEdit={() => setIsEditDialogOpen(true)}
          onDelete={() => setIsDeleteDialogOpen(true)}
        />
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-900">{announcement.content}</p>
        {announcement.image_url && (
          <img 
            src={announcement.image_url} 
            alt="Contenu de l'annonce" 
            className="rounded-lg max-h-96 w-full object-cover" 
          />
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center border-t pt-4">
        <AnnouncementReactions
          reactions={reactions}
          userReaction={userReaction}
          onReact={onReact}
          disabled={!currentUserId || isLoading}
        />
        <CommentButton
          count={commentCount}
          onClick={() => setIsCommentsOpen(true)}
          disabled={!currentUserId || isLoading}
        />
      </CardFooter>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <EditAnnouncementForm 
            announcement={announcement} 
            onSubmit={handleEdit}
            onCancel={() => setIsEditDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette annonce ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'annonce sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isLoading}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Commentaires</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <CommentsList comments={announcement.comments} />
            <CommentForm onSubmit={onComment} />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
