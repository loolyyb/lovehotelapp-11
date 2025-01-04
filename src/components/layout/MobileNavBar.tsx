import { House, Search, Blinds, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";

export const MobileNavBar = () => {
  const isMobile = useIsMobile();
  const location = useLocation();

  if (!isMobile) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-burgundy/90 backdrop-blur-sm border-t border-burgundy/20 px-2 py-1 z-50">
      <div className="flex justify-around items-center">
        <Link
          to="/"
          className={`flex flex-col items-center p-2 ${
            isActive("/") ? "text-champagne" : "text-rose/80"
          }`}
        >
          <House className="w-5 h-5 stroke-[1.5]" />
          <span className="text-xs mt-1">Accueil</span>
        </Link>

        <Link
          to="/profiles"
          className={`flex flex-col items-center p-2 ${
            isActive("/profiles") ? "text-champagne" : "text-rose/80"
          }`}
        >
          <Search className="w-5 h-5 stroke-[1.5]" />
          <span className="text-xs mt-1">Recherche</span>
        </Link>

        <a
          href="https://lovehotelaparis.fr/rideaux-ouverts/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center p-2 text-rose/80"
        >
          <Blinds className="w-5 h-5 stroke-[1.5]" />
          <span className="text-xs mt-1">Rideaux</span>
        </a>

        <Link
          to="/lover-coin"
          className={`flex flex-col items-center p-2 ${
            isActive("/lover-coin") ? "text-champagne" : "text-rose/80"
          }`}
        >
          <Heart className="w-5 h-5 stroke-[1.5]" />
          <span className="text-xs mt-1">LoverCoin</span>
        </Link>
      </div>
    </nav>
  );
};