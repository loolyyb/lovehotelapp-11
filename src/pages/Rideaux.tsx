import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLogger } from "@/hooks/useLogger";
import { useAlert } from "@/hooks/useAlert";

interface RideauxData {
  status: string;
  message: string;
  data: {
    rideaux_ouverts: boolean;
    message: string;
  };
}

export default function Rideaux() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RideauxData | null>(null);
  const { toast } = useToast();
  const logger = useLogger("Rideaux");
  const alert = useAlert("Rideaux");

  useEffect(() => {
    const fetchRideauxData = async () => {
      try {
        const response = await fetch("https://lovehotelaparis.fr/wp-json/zlhu_api/v2/rideaux_ouverts");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        logger.info("Rideaux data fetched successfully", { data: jsonData });
        setData(jsonData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue";
        console.error("Error fetching rideaux data:", error);
        logger.error("Failed to fetch rideaux data", { error: errorMessage });
        alert.captureException(error instanceof Error ? error : new Error(errorMessage));
        toast({
          title: "Erreur",
          description: "Impossible de charger les données. Veuillez réessayer plus tard.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRideauxData();
  }, [toast, logger, alert]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-burgundy" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-cormorant font-bold text-burgundy mb-8">
        Rideaux
      </h1>
      <div className="glass-card p-6 rounded-lg shadow-lg bg-white/80 backdrop-blur-sm">
        {data ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-cormorant text-burgundy">
                État des rideaux
              </h2>
              <span className={`px-4 py-2 rounded-full ${data.data.rideaux_ouverts ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {data.data.rideaux_ouverts ? 'Ouverts' : 'Fermés'}
              </span>
            </div>
            <p className="text-lg text-gray-700">
              {data.data.message}
            </p>
          </div>
        ) : (
          <p className="text-lg text-gray-700">
            Aucune information disponible pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}