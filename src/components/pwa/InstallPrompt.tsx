import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const hasShownPrompt = localStorage.getItem('hasShownInstallPrompt');
    if (hasShownPrompt) return;

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      toast({
        title: "Installez l'application",
        description: "Pour installer l'application sur votre iPhone : appuyez sur le bouton 'Partager' puis 'Sur l'écran d'accueil'",
      });
      localStorage.setItem('hasShownInstallPrompt', 'true');
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);

      toast({
        title: "Application disponible",
        description: "Installez Love Hotel sur votre appareil pour une meilleure expérience",
      });
      localStorage.setItem('hasShownInstallPrompt', 'true');
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [toast]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      const outcome = await deferredPrompt.prompt();
      console.log(`Installation prompt outcome: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('Utilisateur a accepté l\'installation');
        toast({
          title: "Installation en cours",
          description: "Merci d'avoir installé Love Hotel !",
        });
      } else {
        console.log('Utilisateur a refusé l\'installation');
      }
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt || isIOS) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg animate-slide-in-bottom">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1 mr-4">
          <h3 className="text-lg font-semibold text-burgundy">
            Installer Love Hotel
          </h3>
          <p className="text-sm text-gray-600">
            Installez notre application pour une meilleure expérience
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleInstall}
            className="bg-burgundy hover:bg-burgundy/90 text-white select-none"
          >
            Installer
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPrompt(false)}
            className="text-gray-500 select-none"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}