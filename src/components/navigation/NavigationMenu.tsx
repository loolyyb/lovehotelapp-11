import { Menu, Home, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const NavigationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      setIsOpen(false);
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
    <div className="fixed top-4 left-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="bg-white/80 backdrop-blur-sm hover:bg-white/90">
            <Menu className="h-5 w-5 text-burgundy" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-white/95 backdrop-blur-sm flex flex-col">
          <nav className="flex flex-col gap-4 mt-8 flex-grow">
            <Link 
              to="/" 
              className="flex items-center gap-3 px-4 py-2 text-burgundy hover:bg-rose/10 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Home className="h-5 w-5" />
              <span>Accueil</span>
            </Link>
            <Link 
              to="/profile" 
              className="flex items-center gap-3 px-4 py-2 text-burgundy hover:bg-rose/10 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-5 w-5" />
              <span>Mon Profil</span>
            </Link>
          </nav>
          <div className="mb-8">
            <Button
              variant="outline"
              className="w-full border-burgundy text-burgundy hover:bg-burgundy/5 flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Se déconnecter
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};