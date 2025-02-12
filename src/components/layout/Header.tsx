
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SideMenu } from "./header/SideMenu";
import { UserMenu } from "./header/UserMenu";
import { NotificationsMenu } from "./header/NotificationsMenu";
import { NavigationIcons } from "./header/NavigationIcons";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useUserAvatar } from "@/hooks/useUserAvatar";

export function Header({ userProfile }: { userProfile?: any }) {
  const navigate = useNavigate();
  const { unreadCount } = useUnreadMessages(userProfile?.user_id);
  const { avatarUrl } = useUserAvatar(userProfile);

  const handleLogout = async () => {
    try {
      window.location.href = "https://lovehotelaparis.fr/";
      await supabase.auth.signOut();
      localStorage.removeItem('supabase.auth.token');
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4">
        <div className="w-full h-16 flex items-center justify-between">
          <SideMenu />

          <div className="flex items-center gap-4">
            <NavigationIcons unreadCount={unreadCount} />
            <NotificationsMenu />
            <UserMenu
              avatarUrl={avatarUrl}
              fullName={userProfile?.full_name}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
