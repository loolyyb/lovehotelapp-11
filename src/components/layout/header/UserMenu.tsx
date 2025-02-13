import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEFAULT_AVATAR_URL = "https://lovehotelapp.com/wp-content/uploads/2025/02/avatar-love-hotel-v2.jpg";

interface UserMenuProps {
  avatarUrl: string | null;
  fullName?: string;
  onLogout: () => void;
}

export function UserMenu({ avatarUrl, fullName, onLogout }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-0 hover:bg-transparent">
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarImage src={avatarUrl || DEFAULT_AVATAR_URL} alt={fullName} />
            <AvatarFallback>
              <img
                src={DEFAULT_AVATAR_URL}
                alt="Default Avatar"
                className="w-full h-full object-cover"
              />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            <span>Mon Profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-2 text-burgundy cursor-pointer"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
