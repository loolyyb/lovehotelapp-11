import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function ServiceWorkerManager() {
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then((registration) => {
          console.log('ServiceWorker registration successful');
          
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  toast({
                    title: "Mise à jour disponible",
                    description: "Une nouvelle version est disponible. La page va se recharger automatiquement.",
                    duration: 5000,
                  });
                  
                  setTimeout(() => {
                    window.location.reload();
                  }, 5000);
                }
              };
            }
          };
        }).catch((error) => {
          console.error('ServiceWorker registration failed:', error);
        });
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, [toast]);

  return null;
}