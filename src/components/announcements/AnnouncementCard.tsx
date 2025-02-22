import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, ThumbsUp, Heart, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EditAnnouncementForm } from "./EditAnnouncementForm";
import { CommentForm } from "./CommentForm";
import { CommentsList } from "./CommentsList";
import type { AnnouncementWithRelations } from "@/types/announcements.types";

interface AnnouncementCardProps {
  announcement: AnnouncementWithRelations;
  onReact: (type: string) => void;
  onComment: (content: string) => Promise<void>;
  onEdit: (content: string, imageUrl?: string) => Promise<void>;
  onDelete: () => Promise<void>;
  reactions: {
    type: string;
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
      <CardHeader className="flex flex-row items-center gap-4 bg-white">
        <Avatar>
          <AvatarImage src={announcement.user.avatar_url} />
          <AvatarFallback>{announcement.user.full_name?.[0] || '?'}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{announcement.user.full_name}</span>
            <span className="text-sm text-gray-600">
              {formatDistanceToNow(new Date(announcement.created_at), {
                addSuffix: true,
                locale: fr
              })}
            </span>
          </div>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setIsDeleteDialogOpen(true)} 
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 bg-white">
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
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`${userReaction === 'like' ? 'text-[#ce0067]' : 'text-gray-700'} hover:text-[#ce0067]`}
            disabled={!currentUserId || isLoading}
            onClick={() => onReact('like')}
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            <span>{reactions.find(r => r.type === 'like')?.count || 0}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`${userReaction === 'love' ? 'text-[#ce0067]' : 'text-gray-700'} hover:text-[#ce0067]`}
            disabled={!currentUserId || isLoading}
            onClick={() => onReact('love')}
          >
            <Heart className="w-4 h-4 mr-2" />
            <span>{reactions.find(r => r.type === 'love')?.count || 0}</span>
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-700 hover:text-[#ce0067]"
          disabled={!currentUserId || isLoading}
          onClick={() => setIsCommentsOpen(true)}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          <span>{commentCount}</span>
        </Button>
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
