import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  compatibility_score?: number;
}

interface MatchingCardProps {
  profile: Profile;
  onProfileClick: (id: string) => void;
  onMessageClick: (id: string) => void;
  index: number;
}

export function MatchingCard({ profile, onProfileClick, onMessageClick, index }: MatchingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
        <div className="p-6 space-y-4">
          <div 
            className="flex items-center space-x-4 cursor-pointer"
            onClick={() => onProfileClick(profile.id)}
          >
            <div className="relative">
              <img
                src={profile.avatar_url || "/placeholder.svg"}
                alt={profile.full_name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full h-8 w-8 flex items-center justify-center font-bold">
                {profile.compatibility_score}%
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-burgundy">
                {profile.full_name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {profile.bio}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-burgundy hover:text-rose-600 hover:bg-rose-50"
              onClick={() => onProfileClick(profile.id)}
            >
              <Heart className="w-5 h-5 mr-2" />
              Profil
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-burgundy hover:text-rose-600 hover:bg-rose-50"
              onClick={() => onMessageClick(profile.id)}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Message
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}