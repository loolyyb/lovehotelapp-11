
import { House, Search, Blinds, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";

export const MobileNavBar = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { session } = useAuthSession();

  // Ne pas afficher la barre si on n'est pas sur mobile ou si l'utilisateur n'est pas connecté
  if (!isMobile || !session) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#2A2726] border-t border-white/20 px-2 py-1 z-50">
      <div className="flex justify-around items-center">
        <Link
          to="/"
          className={`flex flex-col items-center p-2 transition-colors duration-200 ${
            isActive("/") ? "text-[#f3ebad]" : "text-white hover:text-rose-200"
          }`}
        >
          <House className="w-5 h-5 stroke-[1.5]" />
          <span className="text-xs mt-1">Accueil</span>
        </Link>

        <Link
          to="/profiles"
          className={`flex flex-col items-center p-2 transition-colors duration-200 ${
            isActive("/profiles") ? "text-[#f3ebad]" : "text-white hover:text-rose-200"
          }`}
        >
          <Search className="w-5 h-5 stroke-[1.5]" />
          <span className="text-xs mt-1">Recherche</span>
        </Link>

        <Link
          to="/rideaux-ouverts"
          className={`flex flex-col items-center p-2 transition-colors duration-200 ${
            isActive("/rideaux-ouverts") ? "text-[#f3ebad]" : "text-white hover:text-rose-200"
          }`}
        >
          <Blinds className="w-5 h-5 stroke-[1.5]" />
          <span className="text-xs mt-1">Rideaux</span>
        </Link>

        <Link
          to="/lover-coin"
          className={`flex flex-col items-center p-2 transition-colors duration-200 ${
            isActive("/lover-coin") ? "text-[#f3ebad]" : "text-white hover:text-rose-200"
          }`}
        >
          <Heart className="w-5 h-5 stroke-[1.5]" />
          <span className="text-xs mt-1">LoverCoin</span>
        </Link>
      </div>
    </nav>
  );
};
