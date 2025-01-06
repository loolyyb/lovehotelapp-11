import { useEffect, useState } from "react";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RideauxData {
  html: string;
  stylesheet: string;
  javascript: string;
}

const RideauxOuverts = () => {
  const [data, setData] = useState<RideauxData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://lovehotelaparis.fr/wp-json/zlhu_api/v3/rideaux_ouverts');
        const jsonData = await response.json();
        setData(jsonData);

        // Load external stylesheet
        if (jsonData.stylesheet) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = jsonData.stylesheet;
          document.head.appendChild(link);
        }

        // Load external JavaScript
        if (jsonData.javascript) {
          const script = document.createElement('script');
          script.src = jsonData.javascript;
          script.async = true;
          document.body.appendChild(script);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données. Veuillez réessayer plus tard.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      // Remove injected stylesheet and script when component unmounts
      const injectedStylesheet = document.querySelector(`link[href="${data?.stylesheet}"]`);
      const injectedScript = document.querySelector(`script[src="${data?.javascript}"]`);
      
      if (injectedStylesheet) {
        injectedStylesheet.remove();
      }
      if (injectedScript) {
        injectedScript.remove();
      }
    };
  }, [toast]);

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-4.5rem)] flex items-center justify-center bg-background">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-cormorant mb-8">Rideaux Ouverts</h1>
        {data?.html && (
          <div 
            dangerouslySetInnerHTML={{ __html: data.html }} 
            className="bg-white rounded-lg shadow-lg p-6"
          />
        )}
      </div>
      <InstallPrompt />
    </div>
  );
};

export default RideauxOuverts;