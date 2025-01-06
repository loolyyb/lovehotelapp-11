import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLogger } from "@/hooks/useLogger";
import { useAlert } from "@/hooks/useAlert";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

interface RideauxOuvertsData {
  title: string;
  content: string;
  status: number;
}

const RideauxOuverts = () => {
  const [data, setData] = useState<RideauxOuvertsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const logger = useLogger("RideauxOuverts");
  const alert = useAlert("RideauxOuverts");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("https://lovehotelaparis.fr/wp-json/wp/v2/pages/rideaux-ouverts");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData({
          title: result.title.rendered,
          content: result.content.rendered,
          status: result.status
        });

        logger.info("Rideaux Ouverts content fetched successfully");
      } catch (error) {
        const errorMessage = "Impossible de charger le contenu. Veuillez réessayer plus tard.";
        logger.error("Failed to fetch Rideaux Ouverts content", { error });
        alert.captureException(error as Error);
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast, logger, alert]);

  if (isLoading) {
    return (
      <div className="w-full min-h-[calc(100vh-4.5rem)] bg-cream flex items-center justify-center">
        <LoaderCircle className="h-12 w-12 text-burgundy animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-[calc(100vh-4.5rem)] bg-cream flex flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="h-12 w-12 text-burgundy" />
        <p className="text-burgundy text-lg text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] bg-cream relative overflow-hidden p-4">
      {data && (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-cormorant text-burgundy mb-8">{data.title}</h1>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        </div>
      )}
      <InstallPrompt />
    </div>
  );
};

export default RideauxOuverts;