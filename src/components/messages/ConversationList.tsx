import { useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useStableConversations } from "@/hooks/conversations/useStableConversations";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { AlertTriangle, RefreshCw, UserPlus, UserX } from "lucide-react";
import { useLogger } from "@/hooks/useLogger";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useConversationAuth } from "@/hooks/conversations/useConversationAuth";
import { useToast } from "@/hooks/use-toast";

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
  const logger = useLogger("ConversationList");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    authChecked,
    hasAuthError,
    isRetrying: isAuthRetrying,
    retryAuth
  } = useConversationAuth();
  
  const {
    conversations,
    isLoading,
    isRefreshing,
    error,
    refreshConversations,
    currentProfileId
  } = useStableConversations();

  const [isRefreshingManually, setIsRefreshingManually] = useState(false);

  const handleLogin = useCallback(() => {
    logger.info("Redirecting to login page");
    navigate("/login", { state: { returnUrl: "/messages" } });
  }, [navigate, logger]);

  const handleRetry = useCallback(async () => {
    logger.info("Manually retrying conversation fetch");
    setIsRefreshingManually(true);
    
    try {
      // First try to fix auth if needed
      if (hasAuthError) {
        const authSuccess = await retryAuth();
        if (!authSuccess) {
          setIsRefreshingManually(false);
          return;
        }
      }
      
      // Then refresh conversations
      await refreshConversations(false); // Force fresh fetch
      toast({
        title: "Rafraîchissement réussi",
        description: "Vos conversations ont été mises à jour."
      });
    } catch (error: any) {
      logger.error("Error in retry", { error });
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Problème de connexion au serveur. Veuillez réessayer plus tard."
      });
    } finally {
      setIsRefreshingManually(false);
    }
  }, [refreshConversations, retryAuth, hasAuthError, logger, toast]);

  const handleRefresh = useCallback(() => {
    refreshConversations(false); // Force fresh fetch on manual refresh
  }, [refreshConversations]);

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
            disabled={isAuthRetrying || isRefreshingManually}
          >
            {(isAuthRetrying || isRefreshingManually) ? (
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
          disabled={isRefreshingManually}
        >
          {isRefreshingManually ? (
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
          Vous n'avez pas encore de conversations. Explorez les profils pour commencer une discussion.
        </p>
        <div className="flex space-x-3">
          <Button 
            onClick={handleRetry} 
            variant="outline"
            className="border-[#f3ebad]/30 text-[#f3ebad] hover:bg-[#f3ebad]/10"
            disabled={isRefreshingManually}
          >
            {isRefreshingManually ? (
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
              onClick={handleRefresh}
              disabled={isRefreshingManually || isRefreshing}
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
