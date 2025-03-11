
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, MessageSquare, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmptyStateProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  isNetworkError?: boolean;
  isLoading?: boolean;
}

export function EmptyState({ 
  onRefresh, 
  isRefreshing, 
  isNetworkError = false,
  isLoading = false
}: EmptyStateProps) {
  const navigate = useNavigate();

  const handleExploreProfiles = () => {
    navigate("/profiles");
  };
  
  // When we're in a conversation and messages are loading, show the loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <MessageSquare className="w-16 h-16 mb-4 text-[#f3ebad]/60" />
        <h2 className="mb-6 text-xl font-semibold text-[#f3ebad]">
          Les messages sont en cours de chargement
        </h2>
        <Button
          onClick={onRefresh}
          className="bg-[#f3ebad] text-[#40192C] hover:bg-[#f3ebad]/90"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Actualisation...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </>
          )}
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      {isNetworkError ? (
        <AlertTriangle className="w-16 h-16 mb-4 text-amber-400" />
      ) : (
        <MessageSquare className="w-16 h-16 mb-4 text-[#f3ebad]/60" />
      )}
      
      <h2 className="mb-2 text-xl font-semibold text-[#f3ebad]">
        {isNetworkError 
          ? "Problème de connexion" 
          : "Aucune conversation"}
      </h2>
      
      <p className="mb-6 text-[#f3ebad]/70 max-w-md">
        {isNetworkError
          ? "Impossible de se connecter au serveur. Vérifiez votre connexion internet et réessayez."
          : "Vous n'avez pas encore de conversations. Commencez par explorer les profils et envoyez un message à quelqu'un qui vous intéresse."}
      </p>
      
      <div className="flex gap-3">
        <Button
          onClick={onRefresh}
          className="bg-[#f3ebad] text-[#40192C] hover:bg-[#f3ebad]/90"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Actualisation...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              {isNetworkError ? "Réessayer" : "Actualiser"}
            </>
          )}
        </Button>
        
        {!isNetworkError && (
          <Button 
            onClick={handleExploreProfiles}
            variant="outline" 
            className="border-[#f3ebad]/30 text-[#f3ebad] hover:bg-[#f3ebad]/10"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Explorer les profils
          </Button>
        )}
      </div>
    </div>
  );
}
