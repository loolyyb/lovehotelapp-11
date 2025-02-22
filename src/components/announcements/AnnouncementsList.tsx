
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Announcement } from "./Announcement";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useLogger } from "@/hooks/useLogger";

interface AnnouncementType {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

// Define the raw data structure from Supabase
interface RawAnnouncementData {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState<AnnouncementType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const logger = useLogger('AnnouncementsList');

  useEffect(() => {
    fetchAnnouncements();
    const unsubscribe = subscribeToAnnouncements();
    return () => {
      unsubscribe();
    };
  }, []);

  const fetchAnnouncements = async () => {
    try {
      logger.info('Début de la récupération des annonces');
      
      const { data: rawData, error } = await supabase
        .from('announcements')
        .select(`
          id,
          content,
          image_url,
          created_at,
          user_id,
          profiles!user_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Erreur dans la requête Supabase:', { error });
        throw error;
      }

      if (!rawData) {
        logger.info('Aucune donnée retournée par la requête');
        setAnnouncements([]);
        return;
      }

      logger.info('Données brutes reçues:', { 
        count: rawData.length,
        sample: rawData[0] 
      });

      const transformedData: AnnouncementType[] = (rawData as RawAnnouncementData[]).map(announcement => ({
        id: announcement.id,
        content: announcement.content,
        image_url: announcement.image_url,
        created_at: announcement.created_at,
        user_id: announcement.user_id,
        full_name: announcement.profiles?.full_name ?? "Utilisateur inconnu",
        avatar_url: announcement.profiles?.avatar_url ?? null
      }));

      logger.info('Transformation terminée:', { 
        count: transformedData.length,
        sample: transformedData[0] 
      });

      setAnnouncements(transformedData);
    } catch (error) {
      logger.error('Erreur lors de la récupération des annonces:', { error });
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les annonces"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToAnnouncements = () => {
    logger.info('Configuration de la souscription temps réel');
    
    const channel = supabase
      .channel('announcements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        (payload) => {
          logger.info('Mise à jour temps réel reçue:', { payload });
          fetchAnnouncements();
        }
      )
      .subscribe((status) => {
        logger.info('Statut de la souscription:', { status });
      });

    return () => {
      logger.info('Nettoyage de la souscription temps réel');
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
