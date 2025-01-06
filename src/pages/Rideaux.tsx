import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Rideaux() {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(false);
      } catch (error) {
        console.error("Error initializing Rideaux page:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la page. Veuillez réessayer plus tard.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    init();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-cormorant font-bold text-burgundy mb-8">
        Rideaux
      </h1>
      <div className="glass-card p-6 rounded-lg">
        <p className="text-lg mb-4">
          Contenu en cours de développement...
        </p>
      </div>
    </div>
  );
}