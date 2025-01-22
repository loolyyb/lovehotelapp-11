import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function UpdatePrompt() {
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                toast({
                  title: "Mise à jour disponible",
                  description: "Une nouvelle version est disponible. La page va se recharger automatiquement.",
                  duration: 5000,
                });
                
                setTimeout(() => {
                  window.location.reload();
                }, 5000);
              }
            });
          }
        });
      });
    }
  }, [toast]);

  return null;
}