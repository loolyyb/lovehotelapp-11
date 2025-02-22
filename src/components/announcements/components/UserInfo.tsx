
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserInfoProps {
  full_name: string | null;
  avatar_url: string | null;
}

export function UserInfo({ full_name, avatar_url }: UserInfoProps) {
  const displayName = full_name || 'Utilisateur inconnu';
  
  return (
    <div className="flex items-center gap-4" aria-label={`Informations de ${displayName}`}>
      <Avatar className="h-10 w-10">
        <AvatarImage 
          src={avatar_url || ''} 
          alt={displayName} 
        />
        <AvatarFallback>
          <User className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <h3 className="font-semibold text-secondary">
        {displayName}
      </h3>
    </div>
  );
}
