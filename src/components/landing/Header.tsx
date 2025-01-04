import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt !",
    });
    navigate("/");
  };

  const session = supabase.auth.getSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-burgundy">
          <Heart className="w-8 h-8 fill-current" />
          <span className="text-xl font-playfair font-bold">LoveH</span>
        </Link>
        {session ? (
          <Button 
            variant="outline" 
            className="border-burgundy text-burgundy hover:bg-burgundy/5"
            onClick={handleLogout}
          >
            Se déconnecter
          </Button>
        ) : (
          <Link to="/login">
            <Button variant="outline" className="border-burgundy text-burgundy hover:bg-burgundy/5">
              Se connecter
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}