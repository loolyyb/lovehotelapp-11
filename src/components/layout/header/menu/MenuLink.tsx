import { Link } from "react-router-dom";
import { LucideIcon, Home, Users, CalendarDays, Settings } from "lucide-react";

interface MenuLinkProps {
  to: string;
  label: string;
  onClick?: () => void;
}

export const MenuLink = ({ to, label, onClick }: MenuLinkProps) => {
  // Map routes to icons
  const getIcon = (path: string): LucideIcon => {
    switch (path) {
      case "/":
        return Home;
      case "/profiles":
        return Users;
      case "/reservations":
        return CalendarDays;
      case "/settings":
        return Settings;
      default:
        return Home;
    }
  };

  const Icon = getIcon(to);

  return (
    <Link 
      to={to} 
      className="flex items-center gap-3 px-4 py-2 text-burgundy hover:bg-rose/10 rounded-lg transition-colors"
      onClick={onClick}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
};