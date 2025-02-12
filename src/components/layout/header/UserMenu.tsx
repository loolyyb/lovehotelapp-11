
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

interface UserMenuProps {
  avatarUrl: string | null;
  fullName?: string;
  onLogout: () => void;
}

export function UserMenu({ avatarUrl, fullName, onLogout }: UserMenuProps) {
  console.log("UserMenu received avatarUrl:", avatarUrl); // Debug log

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border border-gray-200">
            {avatarUrl && (
              <AvatarImage 
                src={avatarUrl} 
                alt={fullName || 'Profile'} 
                className="object-cover"
              />
            )}
            <AvatarFallback className="bg-burgundy text-white">
              {fullName?.[0]?.toUpperCase() || '?'}
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
