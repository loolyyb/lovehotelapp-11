import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { SideMenu } from "./SideMenu";

export function HeaderNavigation() {
  return (
    <div className="flex gap-6 md:gap-10">
      <SideMenu />
      <Link to="/dashboard" className="flex items-center space-x-2">
        <Home className="h-6 w-6" />
      </Link>
    </div>
  );
}