import { Link } from "react-router-dom";
import { MenuLink } from "./MenuLink";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MenuNavigationProps {
  onLinkClick?: () => void;
}

export function MenuNavigation({ onLinkClick }: MenuNavigationProps) {
  const { toast } = useToast();

  const handleUpdate = () => {
    // Check if there's a service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update().then(() => {
          toast({
            title: "Mise à jour",
            description: "L'application est en cours de mise à jour...",
            duration: 3000,
          });
          
          // Reload the page after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        });
      });
    }
  };

  return (
    <nav className="space-y-2 py-4">
      <MenuLink to="/" label="Accueil" onClick={onLinkClick} />
      <MenuLink to="/profiles" label="Profils" onClick={onLinkClick} />
      <MenuLink to="/reservations" label="Réservations" onClick={onLinkClick} />
      <MenuLink to="/settings" label="Paramètres" onClick={onLinkClick} />

      <div className="fixed bottom-4 left-4 right-4">
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2 bg-white/50 backdrop-blur-sm hover:bg-white/80"
          onClick={handleUpdate}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Mettre à jour</span>
        </Button>
      </div>
    </nav>
  );
}