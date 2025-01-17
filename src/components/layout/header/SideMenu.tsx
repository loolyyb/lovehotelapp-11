import { Link } from "react-router-dom";
import { Menu, Crown, BedDouble, Utensils, Users, Gift, Brain, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function SideMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

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
            to="/profiles" 
            className="flex items-center gap-3 px-4 py-2 text-burgundy hover:bg-rose/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Crown className="h-5 w-5" />
            <span>Nos lover's</span>
          </Link>
          {isMobile && (
            <Link 
              to="/swipe" 
              className="flex items-center gap-3 px-4 py-2 text-burgundy hover:bg-rose/10 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Heart className="h-5 w-5" />
              <span>Slider les profils</span>
            </Link>
          )}
          <Link 
            to="/reserver-room" 
            className="flex items-center gap-3 px-4 py-2 text-burgundy hover:bg-rose/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <BedDouble className="h-5 h-5" />
            <span>Réserver une Love Room</span>
          </Link>
          <Link 
            to="/rideaux-ouverts" 
            className="flex items-center gap-3 px-4 py-2 text-burgundy hover:bg-rose/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <BedDouble className="h-5 w-5" />
            <span>Rideaux Ouverts</span>
          </Link>
          <Link 
            to="/restaurant-du-love" 
            className="flex items-center gap-3 px-4 py-2 text-burgundy hover:bg-rose/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Utensils className="h-5 w-5" />
            <span>Restaurant du Love</span>
          </Link>
          <Link 
            to="/features" 
            className="flex items-center gap-3 px-4 py-2 text-burgundy hover:bg-rose/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Users className="h-5 w-5" />
            <span>Nos fonctionnalités</span>
          </Link>
          <Link 
            to="/options" 
            className="flex items-center gap-3 px-4 py-2 text-burgundy hover:bg-rose/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Gift className="h-5 w-5" />
            <span>Nos Options</span>
          </Link>
          <Link 
            to="/quiz" 
            className="flex items-center gap-3 px-4 py-2 text-burgundy hover:bg-rose/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Brain className="h-5 w-5" />
            <span>Quiz Love Hotel</span>
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
