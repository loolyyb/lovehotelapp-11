
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Announcement } from "./Announcement";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Loader2 } from "lucide-react";
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

export function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState<AnnouncementType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const logger = useLogger('AnnouncementsList');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const fetchAnnouncements = async () => {
    try {
      setError(null); // Réinitialiser l'erreur avant chaque tentative
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

      const transformedData: AnnouncementType[] = rawData.map(announcement => ({
        id: announcement.id,
        content: announcement.content,
        image_url: announcement.image_url,
        created_at: announcement.created_at,
        user_id: announcement.user_id,
        full_name: announcement.profiles?.full_name ?? "Utilisateur inconnu",
        avatar_url: announcement.profiles?.avatar_url ?? null
      }));

      setAnnouncements(transformedData);
      setRetryCount(0); // Réinitialiser le compteur en cas de succès
    } catch (error) {
      logger.error('Erreur lors de la récupération des annonces:', { error });
      
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        // Utilisation d'un délai exponentiel plafonné pour les retries
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        setError(`Tentative de reconnexion... (${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => {
          fetchAnnouncements();
        }, retryDelay);
      } else {
        const errorMessage = "Impossible de charger les annonces après plusieurs tentatives.";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: errorMessage
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();

    // Configuration de la souscription temps réel avec debounce
    let timeoutId: NodeJS.Timeout;
    let channel = supabase
      .channel('announcements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        () => {
          // Debounce la mise à jour pour éviter les requêtes trop fréquentes
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            fetchAnnouncements();
          }, 1000);
        }
      )
      .subscribe((status) => {
        logger.info('Statut de la souscription:', { status });
      });

    return () => {
      clearTimeout(timeoutId);
      // S'assurer que le canal est correctement nettoyé
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-burgundy" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="text-center">
          <p className="text-destructive font-semibold">Une erreur est survenue</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
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
