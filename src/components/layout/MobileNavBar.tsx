import { House, Search, Blinds, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";

export const MobileNavBar = () => {
  const isMobile = useIsMobile();
  const location = useLocation();

  if (!isMobile) return null;

  // Hide the mobile nav bar on the messages route
  if (location.pathname === "/messages") return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-burgundy/20 px-2 py-1 z-50">
      <div className="flex justify-around items-center">
        <Link
          to="/"
          className={`flex flex-col items-center p-2 transition-colors duration-200 ${
            isActive("/") ? "text-burgundy" : "text-gray-700 hover:text-burgundy"
          }`}
        >
          <House className="w-5 h-5 stroke-[1.5]" />
          <span className="text-xs mt-1 font-medium">Accueil</span>
        </Link>

        <Link
          to="/profiles"
          className={`flex flex-col items-center p-2 transition-colors duration-200 ${
            isActive("/profiles") ? "text-burgundy" : "text-gray-700 hover:text-burgundy"
          }`}
        >
          <Search className="w-5 h-5 stroke-[1.5]" />
          <span className="text-xs mt-1 font-medium">Recherche</span>
        </Link>

        <Link
          to="/rideaux-ouverts"
          className={`flex flex-col items-center p-2 transition-colors duration-200 ${
            isActive("/rideaux-ouverts") ? "text-burgundy" : "text-gray-700 hover:text-burgundy"
          }`}
        >
          <Blinds className="w-5 h-5 stroke-[1.5]" />
          <span className="text-xs mt-1 font-medium">Rideaux</span>
        </Link>

        <Link
          to="/lover-coin"
          className={`flex flex-col items-center p-2 transition-colors duration-200 ${
            isActive("/lover-coin") ? "text-burgundy" : "text-gray-700 hover:text-burgundy"
          }`}
        >
          <Heart className="w-5 h-5 stroke-[1.5]" />
          <span className="text-xs mt-1 font-medium">LoverCoin</span>
        </Link>
      </div>
    </nav>
  );
}