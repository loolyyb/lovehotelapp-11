
import { useState, useEffect } from "react";

export function useUserAvatar(userProfile?: any) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile?.avatar_url) {
      console.log("Setting avatar URL:", userProfile.avatar_url);
      setAvatarUrl(userProfile.avatar_url);
    }
  }, [userProfile?.avatar_url]);

  return { avatarUrl };
}
