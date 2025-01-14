import { NotificationsMenu } from "./NotificationsMenu";
import { UserMenu } from "./UserMenu";

interface HeaderProfileProps {
  profile: {
    avatar_url: string | null;
    full_name?: string;
  };
  onLogout: () => void;
}

export function HeaderProfile({ profile, onLogout }: HeaderProfileProps) {
  return (
    <div className="flex flex-1 items-center justify-end space-x-4">
      <NotificationsMenu />
      <UserMenu
        avatarUrl={profile.avatar_url}
        fullName={profile.full_name}
        onLogout={onLogout}
      />
    </div>
  );
}