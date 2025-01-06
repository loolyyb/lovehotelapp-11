import { useState, useEffect } from 'react';
import { AuthService } from '@/services/AuthService';
import { useToast } from './use-toast';

export const useApiAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const authenticate = async () => {
    setIsLoading(true);
    try {
      const token = await AuthService.login();
      if (token) {
        setIsAuthenticated(true);
        toast({
          title: "Authentification réussie",
          description: "Connexion à l'API établie",
        });
      } else {
        throw new Error("Échec de l'authentification");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Impossible de se connecter à l'API",
      });
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      authenticate();
    } else {
      setIsAuthenticated(true);
      setIsLoading(false);
    }
  }, []);

  return {
    isAuthenticated,
    isLoading,
    authenticate,
  };
};