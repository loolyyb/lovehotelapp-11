import { Link } from "react-router-dom";
import { Menu, Home, User, Info, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function SideMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-rose/10">
          <Menu className="h-5 w-5 text-burgundy" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-white/95 backdrop-blur-sm">
        <img 
          src="https://lovehotelaparis.fr/wp-content/uploads/2024/09/logo-web-love-hotel.png"
          alt="Love Hotel Logo"
          className="h-24 mx-auto mb-6 object-contain"
        />
        <nav className="flex flex-col gap-4">
          <Link 
            to="/" 
            className="flex items-center gap-3 px-4 py-2 text-burgundy hover:bg-rose/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Home className="h-5 w-5" />
            <span>Accueil</span>
          </Link>
          <Link 
            to="/features" 
            className="flex items-center gap-3 px-4 py-2 text-burgundy hover:bg-rose/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Info className="h-5 w-5" />
            <span>Nos Fonctionnalités</span>
          </Link>
          <Link 
            to="/profile" 
            className="flex items-center gap-3 px-4 py-2 text-burgundy hover:bg-rose/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <User className="h-5 w-5" />
            <span>Mon Profil</span>
          </Link>
          <Link 
            to="/reserver-room" 
            className="flex items-center gap-3 px-4 py-2 text-burgundy hover:bg-rose/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <BedDouble className="h-5 w-5" />
            <span>Réserver une Love Room</span>
          </Link>
          <Link 
            to="/rideaux-ouverts" 
            className="flex items-center gap-3 px-4 py-2 text-burgundy hover:bg-rose/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Curtains className="h-5 w-5" />
            <span>Rideaux Ouverts</span>
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}