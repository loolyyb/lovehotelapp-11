
import { useLogger } from "@/hooks/useLogger";
import { Button } from "@/components/ui/button";
import { RefreshCw, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AuthRequiredStateProps {
  isAuthRetrying: boolean;
  isRefreshingManually: boolean;
  handleLogin: () => void;
  handleRetry: () => void;
}

export function AuthRequiredState({
  isAuthRetrying,
  isRefreshingManually,
  handleLogin,
  handleRetry
}: AuthRequiredStateProps) {
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
