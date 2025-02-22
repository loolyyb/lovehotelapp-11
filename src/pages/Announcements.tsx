
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { AnnouncementForm } from "@/components/announcements/AnnouncementForm";
import { Loader } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Database } from "@/integrations/supabase/types/database.types";

type AnnouncementWithRelations = Database['public']['Tables']['announcements']['Row'] & {
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

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<AnnouncementWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { session } = useAuthSession();

  useEffect(() => {
    fetchAnnouncements();
    const channel = subscribeToChanges();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          user:profiles!announcements_user_id_fkey (
            full_name,
            avatar_url
          ),
          reactions:announcement_reactions (
            type:reaction_type,
            user_id
          ),
          comments:announcement_comments (
            id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les annonces"
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChanges = () => {
    return supabase
      .channel("announcements-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "announcements"
        },
        () => {
          fetchAnnouncements();
        }
      )
      .subscribe();
  };

  const handleSubmitAnnouncement = async (content: string, imageUrl?: string) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('announcements')
        .insert({
          content,
          image_url: imageUrl,
          user_id: session.user.id
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre annonce a été publiée"
      });
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de publier l'annonce"
      });
    }
  };

  const handleReaction = async (announcementId: string, reactionType: string) => {
    if (!session?.user?.id) return;

    try {
      const { data: existingReaction } = await supabase
        .from('announcement_reactions')
        .select()
        .eq('announcement_id', announcementId)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          await supabase
            .from('announcement_reactions')
            .delete()
            .eq('id', existingReaction.id);
        } else {
          await supabase
            .from('announcement_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', existingReaction.id);
        }
      } else {
        await supabase
          .from('announcement_reactions')
          .insert({
            announcement_id: announcementId,
            user_id: session.user.id,
            reaction_type: reactionType
          });
      }

      await fetchAnnouncements();
    } catch (error) {
      console.error("Error handling reaction:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de réagir à l'annonce"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-[#ce0067]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#1E1E1E_0%,#CD0067_100%)]">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <AnnouncementForm onSubmit={handleSubmitAnnouncement} />
        <div className="space-y-6">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onReact={(type) => handleReaction(announcement.id, type)}
              onComment={() => {}} // À implémenter dans la prochaine étape
              reactions={Object.entries(
                announcement.reactions.reduce((acc: Record<string, number>, r) => {
                  acc[r.type] = (acc[r.type] || 0) + 1;
                  return acc;
                }, {})
              ).map(([type, count]) => ({ type, count }))}
              commentCount={announcement.comments.length}
              userReaction={
                announcement.reactions.find(
                  (r) => r.user_id === session?.user?.id
                )?.type
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
