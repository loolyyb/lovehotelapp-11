import { useEffect, useState } from "react";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RideauxOuverts = () => {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    toast({
      title: "Erreur",
      description: "Impossible de charger la page. Veuillez réessayer plus tard.",
      variant: "destructive",
    });
  };

  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-cormorant mb-8">Rideaux Ouverts</h1>
        
        {loading && (
          <div className="w-full h-[500px] flex items-center justify-center">
            <Loader className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        
        <iframe
          src="https://lovehotelaparis.fr/wp-json/zlhu_api/v3/rideaux_ouverts"
          className={`w-full min-h-[500px] border-0 rounded-lg shadow-lg ${loading ? 'hidden' : 'block'}`}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title="Rideaux Ouverts"
        />
      </div>
      <InstallPrompt />
    </div>
  );
};

export default RideauxOuverts;