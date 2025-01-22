import { Crown, BedDouble, Utensils, Users, Gift, Brain } from "lucide-react";
import { MenuLink } from "./MenuLink";

interface MenuNavigationProps {
  onLinkClick: () => void;
}

export const MenuNavigation = ({ onLinkClick }: MenuNavigationProps) => {
  const menuItems = [
    { to: "/profiles", icon: Crown, label: "Nos lover's" },
    { to: "/reserver-room", icon: BedDouble, label: "Réserver une Love Room" },
    { to: "/rideaux-ouverts", icon: BedDouble, label: "Rideaux Ouverts" },
    { to: "/restaurant-du-love", icon: Utensils, label: "Restaurant du Love" },
    { to: "/features", icon: Users, label: "Nos fonctionnalités" },
    { to: "/concierge", icon: Crown, label: "Conciergerie sur mesure" },
    { to: "/options", icon: Gift, label: "Nos Options" },
    { to: "/quiz", icon: Brain, label: "Quiz Love Hotel" },
  ];

  return (
    <nav className="flex flex-col gap-4">
      {menuItems.map((item) => (
        <MenuLink
          key={item.to}
          to={item.to}
          icon={item.icon}
          label={item.label}
          onClick={onLinkClick}
        />
      ))}
    </nav>
  );
};