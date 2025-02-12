
import { useState, useEffect } from "react";

export function useUserAvatar(userProfile?: any) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile?.avatar_url) {
      setAvatarUrl(userProfile.avatar_url);
    } else if (userProfile?.id) {
      // Si pas d'avatar_url mais un ID utilisateur, on met une valeur par défaut
      setAvatarUrl(`https://api.dicebear.com/7.x/initials/svg?seed=${userProfile.id}`);
    }
  }, [userProfile?.avatar_url, userProfile?.id]);

  return { avatarUrl };
}
