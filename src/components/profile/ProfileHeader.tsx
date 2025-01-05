import { motion } from "framer-motion";
import { ProfileAvatar } from "./header/ProfileAvatar";
import { ProfileInfo } from "./header/ProfileInfo";

interface ProfileHeaderProps {
  avatarUrl?: string | null;
  fullName?: string | null;
  bio?: string | null;
  canEdit?: boolean;
  onAvatarChange?: (url: string) => void;
  sexualOrientation?: string | null;
  seeking?: string[] | null;
  relationshipType?: string[] | null;
}

export function ProfileHeader({ 
  avatarUrl, 
  fullName, 
  bio, 
  canEdit = false,
  onAvatarChange,
  sexualOrientation,
  seeking,
  relationshipType
}: ProfileHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center space-y-6"
    >
      <ProfileAvatar
        avatarUrl={avatarUrl}
        fullName={fullName}
        canEdit={canEdit}
        onAvatarChange={onAvatarChange}
      />

      <ProfileInfo
        fullName={fullName}
        bio={bio}
        sexualOrientation={sexualOrientation}
        seeking={seeking}
        relationshipType={relationshipType}
      />
    </motion.div>
  );
}