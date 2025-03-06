import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useConversations } from "./hooks/useConversations";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { AlertTriangle, RefreshCw, UserX } from "lucide-react";
import { useLogger } from "@/hooks/useLogger";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { getProfileByAuthId } from "@/utils/conversationUtils";

const DEFAULT_AVATAR_URL = "https://lovehotelapp.com/wp-content/uploads/2025/02/avatar-love-hotel-v2.jpg";

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId: string | null;
  onNetworkError?: () => void;
}

export function ConversationList({ 
  onSelectConversation, 
  selectedConversationId,
  onNetworkError
}: ConversationListProps) {
  const [currentUserProfileId, setCurrentUserProfileId] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [hasAuthError, setHasAuthError] = useState(false);
  const logger = useLogger("ConversationList");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    conversations,
    isLoading,
    error,
    refetch,
    currentProfileId
  } = useConversations();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        logger.info("Checking authentication status");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error("Session check error", { error });
          setHasAuthError(true);
          toast({
            variant: "destructive",
            title: "Erreur d'authentification",
            description: "Votre session a expiré. Veuillez vous reconnecter."
          });
          return;
        }
        
        if (!data.session) {
          logger.warn("No active session found");
          setHasAuthError(true);
          toast({
            variant: "destructive",
            title: "Non connecté",
            description: "Veuillez vous connecter pour accéder à vos messages."
          });
          return;
        }
        
        logger.info("Authentication check successful", { userId: data.session.user.id });
        setHasAuthError(false);
      } catch (e) {
        logger.error("Error checking auth status", { error: e });
        setHasAuthError(true);
      } finally {
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentProfileId) {
      setCurrentUserProfileId(currentProfileId);
      logger.info("Using profile ID from conversations hook", { profileId: currentProfileId });
    } else if (authChecked && !hasAuthError) {
      getCurrentUserProfile();
    }
  }, [currentProfileId, authChecked, hasAuthError, logger]);

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
        toast({
          variant: "destructive",
          title: "Non connecté",
          description: "Veuillez vous connecter pour accéder à vos messages."
        });
        setHasAuthError(true);
        return;
      }
      
      const profile = await getProfileByAuthId(user.id);
      
      if (profile) {
        setCurrentUserProfileId(profile.id);
        logger.info("Current user profile fetched", { profileId: profile.id });
      } else {
        const { data: newProfile, error } = await supabase
          .from('profiles')
          .insert({
            id: crypto.randomUUID(),
            user_id: user.id,
            full_name: user.email?.split('@')[0] || 'Utilisateur',
            role: 'user'
          })
          .select('id')
          .single();
          
        if (error) {
          logger.error("Failed to create profile", { error });
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de créer votre profil. Veuillez contacter le support."
          });
          return;
        }
        
        if (newProfile) {
          setCurrentUserProfileId(newProfile.id);
          logger.info("Created new profile", { profileId: newProfile.id });
        }
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

  const handleLogin = () => {
    logger.info("Redirecting to login page");
    navigate("/login", { state: { returnUrl: "/messages" } });
  };

  const handleRetry = useCallback(async () => {
    logger.info("Manually retrying conversation fetch");
    setIsRetrying(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Non connecté",
          description: "Vous n'êtes pas connecté. Veuillez vous reconnecter."
        });
        setHasAuthError(true);
        return;
      }
      
      setHasAuthError(false);
      
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
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
  }, [refetch, logger, toast, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!hasAuthError) {
        logger.info("Periodic conversation refresh");
        refetch();
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [refetch, logger, hasAuthError]);

  if (hasAuthError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <UserX className="w-12 h-12 text-[#f3ebad]" />
        <h3 className="text-lg font-medium text-[#f3ebad]">Connexion requise</h3>
        <p className="text-sm text-[#f3ebad]/70">Vous devez être connecté pour accéder à vos messages.</p>
        <div className="flex space-x-3">
          <Button 
            onClick={handleLogin}
            className="px-4 py-2 text-sm font-medium text-burgundy bg-[#f3ebad] rounded-md hover:bg-[#f3ebad]/90 transition-colors"
          >
            Se connecter
          </Button>
          <Button 
            onClick={handleRetry} 
            variant="outline"
            className="px-4 py-2 text-sm font-medium text-[#f3ebad] border-[#f3ebad]/30 rounded-md hover:bg-[#f3ebad]/10 transition-colors"
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Vérification...
              </>
            ) : (
              "Vérifier à nouveau"
            )}
          </Button>
        </div>
      </div>
    );
  }

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
    return <EmptyState onRefresh={handleRetry} isRefreshing={isRetrying} />;
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
