
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function UpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Vérifie si un Service Worker est déjà enregistré
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          console.log('Service Worker actuel:', registration);
          
          // Écoute des mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('Nouveau Service Worker trouvé:', newWorker);
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                console.log('État du nouveau Service Worker:', newWorker.state);
                
                // Quand une nouvelle version est disponible et prête
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('Nouvelle version disponible');
                  setShowUpdatePrompt(true);
                }
              });
            }
          });
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update().then(() => {
          console.log('Mise à jour du Service Worker...');
          
          toast({
            title: "Mise à jour en cours",
            description: "L'application va se recharger pour appliquer les mises à jour."
          });
          
          // Recharge la page après un court délai
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        });
      });
    }
  };

  if (!showUpdatePrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg animate-slide-in-bottom">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1 mr-4">
          <h3 className="text-lg font-semibold text-burgundy">
            Mise à jour disponible
          </h3>
          <p className="text-sm text-gray-600">
            Une nouvelle version de Love Hotel est disponible
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleUpdate}
            className="bg-burgundy hover:bg-burgundy/90 text-white select-none"
          >
            Mettre à jour
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowUpdatePrompt(false)}
            className="text-gray-500 select-none"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
