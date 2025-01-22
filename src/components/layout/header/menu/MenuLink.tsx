import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface MenuLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

export const MenuLink = ({ to, icon: Icon, label, onClick }: MenuLinkProps) => {
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