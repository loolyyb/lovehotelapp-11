import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLogger } from "@/hooks/useLogger";
import { useAlert } from "@/hooks/useAlert";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

interface RideauxOuvertsData {
  content: string;  // Changed from { rendered: string } to string to match new API format
}

const RideauxOuverts = () => {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const logger = useLogger("RideauxOuverts");
  const alert = useAlert("RideauxOuverts");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const proxyUrl = "https://corsproxy.io/?";
        const targetUrl = encodeURIComponent("https://lovehotelaparis.fr/wp-json/zlhu_api/v1/rideaux_ouverts");
        const response = await fetch(proxyUrl + targetUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: RideauxOuvertsData = await response.json();
        setContent(data.content); // Updated to use data.content directly instead of data.content.rendered
      } catch (error) {
        logger.error("Failed to fetch Rideaux Ouverts content", { error });
        alert.captureException(error as Error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger le contenu. Veuillez réessayer plus tard.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [toast, logger, alert]);

  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] bg-cream relative overflow-hidden p-4">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
        </div>
      ) : (
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
      <InstallPrompt />
    </div>
  );
};

export default RideauxOuverts;