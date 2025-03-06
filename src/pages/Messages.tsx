
import { useState, useEffect, useCallback, memo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { MessageView } from "@/components/messages/MessageView";
import { ConversationList } from "@/components/messages/ConversationList";
import { useLogger } from "@/hooks/useLogger";
import { supabase } from "@/integrations/supabase/client"; 
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

// Memoized MessageView to prevent unnecessary re-renders
const MemoizedMessageView = memo(({ conversationId, onBack }: { conversationId: string, onBack: () => void }) => {
  return (
    <MessageView 
      key={conversationId}
      conversationId={conversationId}
      onBack={onBack}
    />
  );
});

MemoizedMessageView.displayName = 'MemoizedMessageView';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const location = useLocation();
  const logger = useLogger("Messages");
  const previousConversationRef = useRef<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    logger.info("Messages page mounted");
    
    // Check connection status when component mounts
    checkConnectionStatus();
    
    if (location.state?.conversationId) {
      logger.info("Setting conversation from location state", { conversationId: location.state.conversationId });
      setSelectedConversation(location.state.conversationId);
    }
  }, [location.state, logger]);

  const checkConnectionStatus = async () => {
    setIsCheckingConnection(true);
    setConnectionError(null);
    
    try {
      // Try to get the user to check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        logger.error("Authentication error", { error: authError });
        setConnectionError("Erreur d'authentification. Veuillez vous reconnecter.");
        return;
      }
      
      if (!user) {
        logger.error("No authenticated user");
        setConnectionError("Vous n'êtes pas connecté. Veuillez vous connecter pour accéder à vos messages.");
        return;
      }
      
      // Check if we can query the database
      const { error: queryError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (queryError) {
        logger.error("Database connection error", { error: queryError });
        setConnectionError("Problème de connexion à la base de données. Veuillez réessayer.");
        return;
      }
      
      // Connection is good
      logger.info("Connection check successful");
    } catch (error) {
      logger.error("Connection check failed", { error });
      setConnectionError("Erreur de connexion au serveur. Veuillez vérifier votre connexion Internet.");
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const handleSelectConversation = useCallback((conversationId: string) => {
    // Si on clique sur la conversation déjà sélectionnée, on ne fait rien
    if (selectedConversation === conversationId) {
      logger.info("Conversation already selected, ignoring", { conversationId });
      return;
    }
    
    // Mémoriser l'ancienne valeur pour le logging
    previousConversationRef.current = selectedConversation;
    
    logger.info("Changing selected conversation", { 
      from: previousConversationRef.current, 
      to: conversationId 
    });
    
    // Mettre à jour la conversation sélectionnée
    setSelectedConversation(conversationId);
  }, [selectedConversation, logger]);

  const handleBack = useCallback(() => {
    logger.info("Navigating back from conversation view");
    setSelectedConversation(null);
  }, [logger]);

  if (connectionError) {
    return (
      <div className="flex h-[calc(100vh-4rem)] bg-[#40192C] pt-12 backdrop-blur-sm justify-center items-center">
        <div className="bg-[#40192C]/80 p-8 rounded-lg border border-[#f3ebad]/20 max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-[#f3ebad]/70 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#f3ebad] mb-2">Problème de connexion</h2>
          <p className="text-[#f3ebad]/70 mb-6">{connectionError}</p>
          <Button 
            onClick={checkConnectionStatus}
            className="bg-[#f3ebad] text-[#40192C] hover:bg-[#f3ebad]/90"
            disabled={isCheckingConnection}
          >
            {isCheckingConnection ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Vérification...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#40192C] pt-12 backdrop-blur-sm">
      <div className={`w-full md:w-[380px] border-r border-[#f3ebad]/30 hover:shadow-lg transition-all duration-300 ${selectedConversation ? 'hidden md:block' : ''}`}>
        <ConversationList
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversation}
        />
      </div>
      
      <div className={`flex-1 ${!selectedConversation ? 'hidden md:flex' : ''}`}>
        {selectedConversation ? (
          <MemoizedMessageView
            conversationId={selectedConversation}
            onBack={handleBack}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#f3ebad]/70">
            <p>Sélectionnez une conversation pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
}
