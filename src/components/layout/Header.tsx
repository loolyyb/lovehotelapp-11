import { SideMenu } from "./header/SideMenu";
import { UserMenu } from "./header/UserMenu";
import { NotificationsMenu } from "./header/NotificationsMenu";
import { HeaderNavLinks } from "./header/navigation/HeaderNavLinks";
import { useUnreadMessages } from "./header/hooks/useUnreadMessages";
import { useUserSession } from "./header/hooks/useUserSession";

export function Header({ userProfile }: { userProfile?: any }) {
  const unreadCount = useUnreadMessages(userProfile);
  const { avatarUrl, handleLogout } = useUserSession(userProfile);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4">
        <div className="w-full h-16 flex items-center justify-between">
          <SideMenu />
          
          <div className="flex items-center gap-4">
            <HeaderNavLinks unreadCount={unreadCount} />
            
            <div className="relative">
              <UserMenu 
                avatarUrl={avatarUrl}
                fullName={userProfile?.full_name}
                onLogout={handleLogout}
              />
              <div className="absolute -top-2 -left-2 z-10">
                <NotificationsMenu />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}