import { LogOut, User, MessageSquare, Users } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUnreadMessages } from "./hooks/useUnreadMessages";

interface UserMenuProps {
  avatarUrl?: string;
  fullName?: string;
  onLogout: () => void;
}

export function UserMenu({ avatarUrl, fullName, onLogout }: UserMenuProps) {
  const unreadCount = useUnreadMessages();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={fullName || "User avatar"} />
            <AvatarFallback>{fullName?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <Link to="/profile">
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Mon Profil</span>
          </DropdownMenuItem>
        </Link>
        
        <Link to="/messages">
          <DropdownMenuItem className="cursor-pointer relative">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Messagerie</span>
            {unreadCount > 0 && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-rose text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </DropdownMenuItem>
        </Link>

        <Link to="/features">
          <DropdownMenuItem className="cursor-pointer">
            <Users className="mr-2 h-4 w-4" />
            <span>Nos fonctionnalités</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}