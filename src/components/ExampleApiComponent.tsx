import React, { useEffect, useState } from 'react';
import { useApiAuth } from '@/hooks/useApiAuth';
import { ApiService } from '@/services/ApiService';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';

interface ApiData {
  // Définir l'interface selon les données attendues
  id: string;
  name: string;
}

export function ExampleApiComponent() {
  const { isAuthenticated, isLoading: authLoading } = useApiAuth();
  const [data, setData] = useState<ApiData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      try {
        const response = await ApiService.get<ApiData>('/endpoint');
        setData(response);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de récupérer les données",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, toast]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader className="w-6 h-6 animate-spin text-burgundy" />
      </div>
    );
  }

  if (!data) {
    return <div>Aucune donnée disponible</div>;
  }

  return (
    <div>
      <h2>{data.name}</h2>
      {/* Afficher les autres données */}
    </div>
  );
}