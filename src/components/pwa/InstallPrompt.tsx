import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Detect iOS device
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Show installation instructions for iOS devices
    if (isIOSDevice && !localStorage.getItem('pwaPromptShown')) {
      toast({
        title: "Installez l'application",
        description: "Pour installer l'application sur votre iPhone : appuyez sur le bouton 'Partager' puis 'Sur l'écran d'accueil'",
        duration: 10000,
      });
      localStorage.setItem('pwaPromptShown', 'true');
    }

    const handler = (e: Event) => {
      // Prevent Chrome from showing the default install prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
      setShowPrompt(true);

      // Show Android-specific toast
      if (!isIOSDevice && !localStorage.getItem('pwaPromptShown')) {
        toast({
          title: "Application disponible",
          description: "Installez Love Hotel sur votre téléphone pour une meilleure expérience",
          duration: 8000,
        });
        localStorage.setItem('pwaPromptShown', 'true');
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [toast]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      toast({
        title: "Installation en cours",
        description: "Merci d'avoir installé Love Hotel !",
      });
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt || isIOS) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg animate-slide-up z-50">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex-1 mr-4">
          <p className="text-sm font-medium text-gray-900">
            Installez l'application Love Hotel
          </p>
          <p className="text-sm text-gray-500">
            Accédez rapidement à Love Hotel depuis votre écran d'accueil
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleInstall}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Installer
          </Button>
          <button
            onClick={() => setShowPrompt(false)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};