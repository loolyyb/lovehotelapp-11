import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useStableConversations } from "@/hooks/conversations/useStableConversations";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { AlertTriangle, RefreshCw, UserPlus, UserX } from "lucide-react";
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
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCreatingTestConversation, setIsCreatingTestConversation] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [hasAuthError, setHasAuthError] = useState(false);
  const logger = useLogger("ConversationList");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    conversations,
    isLoading,
    isRefreshing,
    error,
    refreshConversations,
    currentProfileId
  } = useStableConversations();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        logger.info("Checking authentication status");
        const { data: { session }, error } = await supabase.auth.getSession();
        
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
        
        if (!session) {
          logger.warn("No active session found");
          setHasAuthError(true);
          toast({
            variant: "destructive",
            title: "Non connecté",
            description: "Veuillez vous connecter pour accéder à vos messages."
          });
          return;
        }
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        if (profileError) {
          logger.error("Error fetching profile", { error: profileError });
          return;
        }
        
        if (profileData) {
          logger.info("Using existing profile", { ...profileData });
        }
        
        setHasAuthError(false);
      } catch (e) {
        logger.error("Error checking auth status", { error: e });
        setHasAuthError(true);
      } finally {
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [logger, toast]);

  const handleLogin = () => {
    logger.info("Redirecting to login page");
    navigate("/login", { state: { returnUrl: "/messages" } });
  };

  const handleCreateTestConversation = async () => {
    if (!currentProfileId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour créer une conversation."
      });
      return;
    }
    
    setIsCreatingTestConversation(true);
    
    try {
      logger.info("Creating a test conversation", { profileId: currentProfileId });
      
      const { data: otherProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .neq('id', currentProfileId)
        .limit(1);
        
      if (profilesError) {
        throw profilesError;
      }
      
      if (!otherProfiles || otherProfiles.length === 0) {
        logger.warn("No other users found to create conversation with");
        
        const { data: newProfile, error: newProfileError } = await supabase
          .from('profiles')
          .insert({
            id: crypto.randomUUID(),
            user_id: crypto.randomUUID(),
            full_name: 'Support',
            username: 'support',
            role: 'user'
          })
          .select('id')
          .single();
          
        if (newProfileError) {
          throw newProfileError;
        }
        
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            user1_id: currentProfileId,
            user2_id: newProfile.id,
            status: 'active'
          })
          .select()
          .single();
          
        if (convError) {
          throw convError;
        }
        
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            sender_id: newProfile.id,
            content: "Bonjour ! Je suis le support. Comment puis-je vous aider ?"
          });
          
        toast({
          title: "Conversation créée",
          description: "Une conversation de test a été créée avec l'équipe de support."
        });
      } else {
        const otherUser = otherProfiles[0];
        logger.info("Creating conversation with user", { userId: otherUser.id });
        
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            user1_id: currentProfileId,
            user2_id: otherUser.id,
            status: 'active'
          })
          .select()
          .single();
          
        if (convError) {
          throw convError;
        }
        
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            sender_id: otherUser.id,
            content: "Bonjour ! Comment puis-je vous aider ?"
          });
          
        toast({
          title: "Conversation créée",
          description: `Une conversation de test a été créée avec ${otherUser.username || 'un autre utilisateur'}.`
        });
      }
      
      await refetch();
      
    } catch (error) {
      logger.error("Error creating test conversation", { error });
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer une conversation de test. Veuillez réessayer."
      });
    } finally {
      setIsCreatingTestConversation(false);
    }
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
      
      const profile = await getProfileByAuthId(user.id);
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
            username: user.email?.split('@')[0] || 'user_' + Math.floor(Math.random() * 1000),
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
      
      await refreshConversations(false); // Force fresh fetch
      
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
  }, [refreshConversations, logger, toast]);

  useEffect(() => {
    // Periodic refresh of conversations
    const interval = setInterval(() => {
      if (!hasAuthError && authChecked) {
        logger.info("Periodic conversation refresh");
        refreshConversations(true); // Use cache if available
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [refreshConversations, logger, hasAuthError, authChecked]);

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

  if (isLoading && conversations.length === 0) {
    return <LoadingState />;
  }

  if (error && conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
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
      </div>
    );
  }

  logger.info("Rendering conversation list", { 
    conversationsCount: conversations.length,
    currentUserProfileId: currentProfileId
  });

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#f3ebad]/10 flex items-center justify-center">
          <UserPlus className="w-8 h-8 text-[#f3ebad]/70" />
        </div>
        <h3 className="text-lg font-medium text-[#f3ebad]">Aucune conversation</h3>
        <p className="text-sm text-[#f3ebad]/70 max-w-sm">
          Vous n'avez pas encore de conversations. Explorez les profils pour commencer une discussion ou créez une conversation de test.
        </p>
        <div className="flex space-x-3">
          <Button 
            onClick={handleCreateTestConversation}
            className="bg-[#f3ebad] text-burgundy hover:bg-[#f3ebad]/90"
            disabled={isCreatingTestConversation}
          >
            {isCreatingTestConversation ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              "Créer une conversation test"
            )}
          </Button>
          <Button 
            onClick={handleRetry} 
            variant="outline"
            className="border-[#f3ebad]/30 text-[#f3ebad] hover:bg-[#f3ebad]/10"
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Actualisation...
              </>
            ) : (
              "Actualiser"
            )}
          </Button>
        </div>
      </div>
    );
  }

  const activeConversationBgClass = "bg-[#5A293D]";
  const hoverClass = "hover:bg-rose/5";

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-rose/20">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-burgundy text-[#f3ebad]">Messages</h2>
          <div className="flex items-center">
            {isRefreshing && (
              <span className="text-xs text-[#f3ebad]/50 mr-2">Actualisation...</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refreshConversations(false)}
              disabled={isRetrying || isRefreshing}
              className="text-[#f3ebad]/70 hover:text-[#f3ebad] hover:bg-[#f3ebad]/5"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map(conversation => {
          const otherUser = conversation.otherUser;
          const lastMessage = conversation.messages?.[0];
          const isActive = selectedConversationId === conversation.id;
          
          const unreadCount = conversation.messages?.filter((msg: any) => 
            !msg.read_at && msg.sender_id !== currentProfileId
          )?.length || 0;
          
          logger.debug("Rendering conversation", { 
            conversationId: conversation.id, 
            otherUserId: otherUser?.id,
            hasMessages: conversation.messages?.length > 0,
            unreadCount,
            isActive
          });
          
          return (
            <div 
              key={conversation.id} 
              className={`p-4 border-b border-rose/20 cursor-pointer transition-colors ${
                isActive 
                  ? `${activeConversationBgClass} border-r-0` 
                  : hoverClass
              }`} 
              onClick={() => onSelectConversation(conversation.id)}
            >
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
                      {otherUser?.full_name || otherUser?.username || "Utilisateur"}
                    </h3>
                    {lastMessage && <span className="text-xs text-[#f3ebad]/50">
                        {format(new Date(lastMessage.created_at), 'HH:mm', {
                          locale: fr
                        })}
                      </span>}
                  </div>
                  <div className="flex justify-between items-center">
                    {lastMessage && <p className="text-sm text-[#f3ebad]/70 truncate">
                      {lastMessage.content}
                    </p>}
                    
                    {unreadCount > 0 && (
                      <span className="ml-2 bg-rose text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
