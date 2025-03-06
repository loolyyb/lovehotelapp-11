
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useConversations } from "./hooks/useConversations";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useLogger } from "@/hooks/useLogger";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_AVATAR_URL = "https://lovehotelapp.com/wp-content/uploads/2025/02/avatar-love-hotel-v2.jpg";

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
  selectedConversationId: string | null;
}

export function ConversationList({
  onSelectConversation,
  selectedConversationId
}: ConversationListProps) {
  const [currentUserProfileId, setCurrentUserProfileId] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const logger = useLogger("ConversationList");
  const { toast } = useToast();
  
  const {
    conversations,
    isLoading,
    error,
    refetch,
    currentProfileId
  } = useConversations();

  // Use the currentProfileId from useConversations when available
  useEffect(() => {
    if (currentProfileId) {
      setCurrentUserProfileId(currentProfileId);
      logger.info("Using profile ID from conversations hook", { profileId: currentProfileId });
    } else {
      getCurrentUserProfile();
    }
  }, [currentProfileId, logger]);

  const getCurrentUserProfile = async () => {
    try {
      logger.info("Fetching current user profile");
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        logger.warn("No authenticated user found");
        return;
      }
      
      const {
        data: profile,
        error: profileError
      } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
      
      if (profileError) {
        logger.error("Error fetching profile", { 
          error: profileError,
          userId: user.id
        });
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de récupérer votre profil. Veuillez vous reconnecter ou recharger la page."
        });
        return;
      }
      
      if (profile) {
        setCurrentUserProfileId(profile.id);
        logger.info("Current user profile fetched", { profileId: profile.id });
      } else {
        logger.warn("No profile found for current user", { userId: user.id });
        toast({
          variant: "destructive",
          title: "Profil manquant",
          description: "Aucun profil trouvé. Veuillez vous reconnecter ou contacter le support."
        });
      }
    } catch (error) {
      logger.error("Error fetching current user profile:", error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Problème de connexion au serveur. Veuillez réessayer."
      });
    }
  };

  const handleRetry = useCallback(async () => {
    logger.info("Manually retrying conversation fetch");
    setIsRetrying(true);
    
    try {
      // Check authentication first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Non connecté",
          description: "Vous n'êtes pas connecté. Veuillez vous reconnecter."
        });
        return;
      }
      
      // Try to fix profile issues
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (!profile) {
        toast({
          variant: "destructive",
          title: "Profil manquant",
          description: "Création d'un profil en cours..."
        });
        
        // Try to create a profile if missing
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: crypto.randomUUID(),
            user_id: user.id,
            full_name: user.email?.split('@')[0] || 'Utilisateur',
            role: 'user'
          }]);
          
        if (insertError) {
          logger.error("Error creating profile", { error: insertError });
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de créer votre profil. Veuillez contacter le support."
          });
          return;
        }
      }
      
      // Wait a moment for any DB updates to propagate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Now refetch conversations
      await refetch();
      
      toast({
        title: "Rafraîchissement réussi",
        description: "Vos conversations ont été mises à jour."
      });
    } catch (error) {
      logger.error("Error in retry", { error });
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Problème de connexion au serveur. Veuillez réessayer plus tard."
      });
    } finally {
      setIsRetrying(false);
    }
  }, [refetch, logger, toast]);

  // Effect to periodically refresh conversations as a fallback
  useEffect(() => {
    const interval = setInterval(() => {
      logger.info("Periodic conversation refresh");
      refetch();
    }, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [refetch, logger]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose" />
        <h3 className="text-lg font-medium text-[#f3ebad]">Erreur de chargement</h3>
        <p className="text-sm text-[#f3ebad]/70">{error}</p>
        <Button 
          onClick={handleRetry} 
          className="px-4 py-2 text-sm font-medium text-white bg-rose rounded-md hover:bg-rose/90 transition-colors"
          disabled={isRetrying}
        >
          {isRetrying ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Chargement...
            </>
          ) : (
            "Réessayer"
          )}
        </Button>
      </div>;
  }

  logger.info("Rendering conversation list", { 
    conversationsCount: conversations.length,
    currentUserProfileId
  });

  if (conversations.length === 0) {
    return <EmptyState onRefresh={handleRetry} />;
  }

  return <div className="h-full flex flex-col">
      <div className="p-4 border-b border-rose/20">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-burgundy text-[#f3ebad]">Messages</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            disabled={isRetrying}
            className="text-[#f3ebad]/70 hover:text-[#f3ebad] hover:bg-[#f3ebad]/5"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map(conversation => {
          const otherUser = conversation.user1?.id === currentUserProfileId ? conversation.user2 : conversation.user1;
          const lastMessage = conversation.messages?.[0];
          
          logger.debug("Rendering conversation", { 
            conversationId: conversation.id, 
            otherUserId: otherUser?.id,
            hasMessages: conversation.messages?.length > 0
          });
          
          return <div key={conversation.id} className={`p-4 border-b border-rose/20 cursor-pointer hover:bg-rose/5 transition-colors ${selectedConversationId === conversation.id ? 'bg-rose/10' : ''}`} onClick={() => onSelectConversation(conversation.id)}>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={otherUser?.avatar_url || DEFAULT_AVATAR_URL} />
                    <AvatarFallback>
                      <img src={DEFAULT_AVATAR_URL} alt="Default Avatar" className="w-full h-full object-cover" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium text-[#f3ebad] truncate">
                        {otherUser?.full_name || "Utilisateur"}
                      </h3>
                      {lastMessage && <span className="text-xs text-[#f3ebad]/50">
                          {format(new Date(lastMessage.created_at), 'HH:mm', {
                            locale: fr
                          })}
                        </span>}
                    </div>
                    {lastMessage && <p className="text-sm text-[#f3ebad]/70 truncate">
                        {lastMessage.content}
                      </p>}
                  </div>
                </div>
              </div>;
        })}
      </div>
    </div>;
}
