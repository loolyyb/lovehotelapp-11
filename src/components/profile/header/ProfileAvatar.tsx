import { Camera } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_AVATAR_URL = "https://lovehotelapp.com/wp-content/uploads/2025/02/avatar-love-hotel-v2.jpg";

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  fullName?: string | null;
  canEdit?: boolean;
  onAvatarChange?: (url: string) => void;
}

export function ProfileAvatar({
  avatarUrl,
  fullName,
  canEdit = false,
  onAvatarChange
}: ProfileAvatarProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Vous devez sélectionner une image à uploader.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('profile_photos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile_photos')
        .getPublicUrl(filePath);

      if (onAvatarChange) {
        onAvatarChange(publicUrl);
      }

      toast({
        title: "Succès",
        description: "Votre photo de profil a été mise à jour."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour votre photo de profil."
      });
      console.error("Error uploading avatar:", error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      className="relative w-48 h-48 md:w-64 md:h-64"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-300 via-burgundy-300 to-rose-300"
        animate={{
          scale: [1, 1.02, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      <img
        src={avatarUrl || DEFAULT_AVATAR_URL}
        alt={fullName ?? "Profile"}
        className="w-full h-full object-cover rounded-full border-[0.25px] border-white shadow-lg relative z-10"
      />

      {canEdit && (
        <label
          htmlFor="avatar-upload"
          className="absolute bottom-2 right-2 p-2 rounded-full shadow-lg cursor-pointer transition-all duration-200 transform hover:scale-110 z-20 bg-[#ce0067]"
        >
          <Camera className="w-6 h-6 text-burgundy bg-inherit rounded-lg" />
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}
    </motion.div>
  );
}
