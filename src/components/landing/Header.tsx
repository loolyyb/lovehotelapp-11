
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session check error:', error);
          setIsAuthenticated(false);
          return;
        }
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event);
      
      if (event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(!!session);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      } else if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(!!session);
      }

      // Handle authentication errors
      if (event === 'USER_UPDATED' && !session) {
        toast({
          variant: "destructive",
          title: "Erreur d'authentification",
          description: "Vos identifiants sont invalides. Veuillez réessayer.",
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear any stored tokens
      localStorage.removeItem('supabase.auth.token');
      
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion.",
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="w-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#ce0067]">
            <Heart className="w-8 h-8 fill-current" />
            <span className="text-xl font-playfair font-bold">LoveH</span>
          </Link>
          {isAuthenticated ? (
            <Button 
              variant="outline" 
              className="border-[#ce0067] text-[#ce0067] hover:bg-[#ce0067]/5"
              onClick={handleLogout}
            >
              Se déconnecter
            </Button>
          ) : (
            <Link to="/login">
              <Button variant="outline" className="border-[#ce0067] text-[#ce0067] hover:bg-[#ce0067]/5">
                Se connecter
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

