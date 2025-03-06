
import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Announcement } from "./Announcement";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Loader2 } from "lucide-react";
import { useLogger } from "@/hooks/useLogger";
import debounce from 'lodash/debounce';

interface AnnouncementType {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

// Define an interface for the profile data
interface ProfileData {
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState<AnnouncementType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const logger = useLogger('AnnouncementsList');
  const lastFetchRef = useRef<number>(0);

  const fetchAnnouncements = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < 1000) {
      return; // Debounce fetch requests
    }
    lastFetchRef.current = now;

    try {
      setError(null);
      logger.info('Début de la récupération des annonces');
      
      const { data: rawData, error: queryError } = await supabase
        .from('announcements')
        .select(`
          id,
          content,
          image_url,
          created_at,
          user_id,
          profiles!user_id (
            full_name,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (queryError) {
        logger.error('Erreur dans la requête Supabase:', { error: queryError });
        throw queryError;
      }

      if (!rawData) {
        logger.info('Aucune donnée retournée par la requête');
        setAnnouncements([]);
        return;
      }

      const transformedData: AnnouncementType[] = rawData.map(announcement => {
        // Fix: Cast the profile data with the appropriate type or use a safe default
        const profileData = (announcement.profiles as ProfileData) || { 
          full_name: null, 
          username: null, 
          avatar_url: null 
        };
        
        const displayName = profileData.full_name || 
                          profileData.username || 
                          "Utilisateur inconnu";
        
        return {
          id: announcement.id,
          content: announcement.content,
          image_url: announcement.image_url,
          created_at: announcement.created_at,
          user_id: announcement.user_id,
          full_name: displayName,
          avatar_url: profileData.avatar_url
        };
      });

      setAnnouncements(prev => {
        // Compare les nouveaux et anciens IDs pour éviter les re-rendus inutiles
        const prevIds = new Set(prev.map(a => a.id));
        const newIds = new Set(transformedData.map(a => a.id));
        if (prevIds.size === newIds.size && 
            [...prevIds].every(id => newIds.has(id))) {
          return prev;
        }
        return transformedData;
      });
      setError(null);
    } catch (error) {
      logger.error('Erreur lors de la récupération des annonces:', { error });
      const errorMessage = "Une erreur est survenue lors du chargement des annonces. Veuillez réessayer plus tard.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced version of fetchAnnouncements
  const debouncedFetch = useCallback(
    debounce(fetchAnnouncements, 1000, { leading: true, trailing: true }),
    [fetchAnnouncements]
  );

  useEffect(() => {
    fetchAnnouncements();

    const channel = supabase
      .channel('announcements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        debouncedFetch
      )
      .subscribe((status) => {
        logger.info('Statut de la souscription:', { status });
      });

    return () => {
      channel.unsubscribe();
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
