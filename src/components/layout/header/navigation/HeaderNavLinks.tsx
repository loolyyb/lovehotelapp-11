import { Link } from "react-router-dom";
import { MessagesSquare, Percent, Calendar, Trophy, Home } from "lucide-react";

interface HeaderNavLinksProps {
  unreadCount: number;
}

export function HeaderNavLinks({ unreadCount }: HeaderNavLinksProps) {
  return (
    <>
      <Link 
        to="/" 
        className="hover:opacity-80 transition-opacity"
        title="Accueil"
      >
        <Home className="h-5 w-5 text-burgundy stroke-[1.5]" />
      </Link>

      <Link 
        to="/messages" 
        className="relative hover:opacity-80 transition-opacity"
      >
        <MessagesSquare className="h-5 w-5 text-burgundy stroke-[1.5]" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-rose text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Link>

      <Link 
        to="/matching-scores" 
        className="hover:opacity-80 transition-opacity"
        title="Scores de compatibilité"
      >
        <Percent className="h-5 w-5 text-burgundy stroke-[1.5]" />
      </Link>

      <Link 
        to="/events" 
        className="hover:opacity-80 transition-opacity"
        title="Calendrier des événements"
      >
        <Calendar className="h-5 w-5 text-burgundy stroke-[1.5]" />
      </Link>

      <Link 
        to="/challenges" 
        className="hover:opacity-80 transition-opacity"
        title="Défis en couple"
      >
        <Trophy className="h-5 w-5 text-burgundy stroke-[1.5]" />
      </Link>
    </>
  );
}