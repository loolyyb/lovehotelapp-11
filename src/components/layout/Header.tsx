import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Home, User } from "lucide-react";

export function Header({ userProfile }: { userProfile?: any }) {
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-rose/10">
              <Menu className="h-5 w-5 text-burgundy" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-white/95 backdrop-blur-sm">
            <nav className="flex flex-col gap-4 mt-8">
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
              <Button
                variant="outline"
                className="mt-auto border-burgundy text-burgundy hover:bg-burgundy/5 flex items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Se déconnecter
              </Button>
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/profile" className="hover:opacity-80 transition-opacity">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.full_name} />
            <AvatarFallback>{userProfile?.full_name?.[0] || '?'}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}