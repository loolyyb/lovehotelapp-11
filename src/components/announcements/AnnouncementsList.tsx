
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Announcement } from "./Announcement";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AnnouncementType {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState<AnnouncementType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnnouncements();
    const unsubscribe = subscribeToAnnouncements();
    return () => {
      unsubscribe();
    };
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          id,
          content,
          image_url,
          created_at,
          user_id,
          profiles:profiles!inner (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to flatten the profiles object
      const transformedData = data.map(announcement => ({
        id: announcement.id,
        content: announcement.content,
        image_url: announcement.image_url,
        created_at: announcement.created_at,
        user_id: announcement.user_id,
        full_name: announcement.profiles?.full_name || null,
        avatar_url: announcement.profiles?.avatar_url || null
      }));

      setAnnouncements(transformedData);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les annonces",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToAnnouncements = () => {
    const channel = supabase
      .channel('announcements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        () => {
          fetchAnnouncements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-burgundy" />
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune annonce pour le moment
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <Announcement
          key={announcement.id}
          announcement={announcement}
        />
      ))}
    </div>
  );
}
