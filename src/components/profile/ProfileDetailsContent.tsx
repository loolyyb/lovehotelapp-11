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
export function ProfileDetailsContent({
  profile,
  preferences
}: ProfileDetailsContentProps) {
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };
  return <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative bg-gradient-to-br from-rose-50/80 to-burgundy-50/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 space-y-8 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-rose-100/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-burgundy-100/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
      </div>

      <div className="relative space-y-8">
        <motion.div variants={itemVariants} className="glass-card rounded-xl p-6 bg-[#ce0067]">
          <ProfileHeader avatarUrl={profile?.avatar_url} fullName={profile?.full_name} bio={profile?.bio} sexualOrientation={profile?.sexual_orientation} seeking={profile?.seeking} relationshipType={profile?.relationship_type} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex flex-wrap gap-3 justify-center">
            {preferences?.interests?.map((interest, index) => <motion.span key={index} variants={itemVariants} whileHover={{
            scale: 1.05,
            backgroundColor: "rgba(255, 255, 255, 0.9)"
          }} className="px-4 py-2 bg-white/70 text-burgundy rounded-full text-sm shadow-sm hover:shadow-md transition-all duration-300">
                {interest}
              </motion.span>)}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ProfileActions profileId={profile.id} />
        </motion.div>

        {profile.description && <motion.div variants={itemVariants} className="glass-card p-6 rounded-xl space-y-4">
            <h2 className="text-2xl font-cormorant font-semibold text-burgundy">À propos</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{profile.description}</p>
          </motion.div>}

        {profile.photo_urls && profile.photo_urls.length > 0 && <motion.div variants={itemVariants}>
            <ProfileGallery photos={profile.photo_urls} />
          </motion.div>}
        
        {profile.seeking && profile.seeking.length > 0 && <motion.div variants={itemVariants}>
            <ProfileSeekingDisplay seeking={profile.seeking} />
          </motion.div>}

        <motion.div variants={itemVariants}>
          <ProfilePreferences preferences={preferences} profile={profile} />
        </motion.div>
      </div>
    </motion.div>;
}