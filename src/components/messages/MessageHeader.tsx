import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Ban, ChevronLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MessageHeaderProps {
  otherUser: any;
  onBack: () => void;
  conversationId: string;
}

export function MessageHeader({ otherUser, onBack, conversationId }: MessageHeaderProps) {
  const { toast } = useToast();

  const handleBlock = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('conversations')
        .update({ 
          status: 'blocked',
          blocked_by: user.id
        })
        .eq('id', conversationId);

      if (error) throw error;

      toast({
        title: "Utilisateur bloqué",
        description: "Vous ne recevrez plus de messages de cet utilisateur",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de bloquer l'utilisateur",
      });
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-rose/20 bg-cream">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Avatar>
          <AvatarImage src={otherUser?.avatar_url} />
          <AvatarFallback>{otherUser?.full_name?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{otherUser?.full_name}</h2>
        </div>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Ban className="h-5 w-5 text-gray-500 hover:text-red-500" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bloquer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action empêchera cet utilisateur de vous envoyer des messages.
              Vous pouvez débloquer l'utilisateur à tout moment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlock}>Bloquer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}