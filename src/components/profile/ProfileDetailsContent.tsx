import { motion } from "framer-motion";
import { Tables } from "@/integrations/supabase/types";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileActions } from "./ProfileActions";
import { ProfileGallery } from "./ProfileGallery";
import { ProfileSeekingDisplay } from "./ProfileSeekingDisplay";
import { ProfilePreferences } from "./ProfilePreferences";

interface ProfileDetailsContentProps {
  profile: Tables<"profiles">;
  preferences: Tables<"preferences"> | null;
}

export function ProfileDetailsContent({ profile, preferences }: ProfileDetailsContentProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-6 md:p-8 space-y-8"
    >
      <div className="flex flex-col items-center space-y-6 relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-rose-100/50 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-burgundy-100/50 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
        </div>

        <motion.div variants={itemVariants}>
          <ProfileHeader 
            avatarUrl={profile.avatar_url}
            fullName={profile.full_name}
            bio={profile.bio}
            sexualOrientation={profile.sexual_orientation}
            seeking={profile.seeking}
            relationshipType={profile.relationship_type}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-center">
          {preferences?.interests?.map((interest, index) => (
            <motion.span
              key={index}
              variants={itemVariants}
              className="px-4 py-2 bg-rose/20 text-burgundy rounded-full text-sm hover:bg-rose/30 transition-colors"
            >
              {interest}
            </motion.span>
          ))}
        </motion.div>

        <motion.div variants={itemVariants}>
          <ProfileActions profileId={profile.id} />
        </motion.div>
      </div>

      {profile.description && (
        <motion.div variants={itemVariants} className="mt-8 p-6 bg-champagne/30 rounded-lg backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-burgundy mb-4">À propos</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{profile.description}</p>
        </motion.div>
      )}

      {profile.photo_urls && profile.photo_urls.length > 0 && (
        <motion.div variants={itemVariants}>
          <ProfileGallery photos={profile.photo_urls} />
        </motion.div>
      )}
      
      {profile.seeking && profile.seeking.length > 0 && (
        <motion.div variants={itemVariants}>
          <ProfileSeekingDisplay seeking={profile.seeking} />
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <ProfilePreferences preferences={preferences} profile={profile} />
      </motion.div>
    </motion.div>
  );
}