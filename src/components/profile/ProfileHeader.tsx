import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileHeaderProps {
  avatarUrl?: string | null;
  fullName?: string | null;
  bio?: string | null;
  canEdit?: boolean;
  onAvatarChange?: (url: string) => void;
}

export function ProfileHeader({ 
  avatarUrl, 
  fullName, 
  bio, 
  canEdit = false,
  onAvatarChange 
}: ProfileHeaderProps) {
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
        description: "Votre photo de profil a été mise à jour.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour votre photo de profil. Veuillez réessayer.",
      });
      console.error("Error uploading avatar:", error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative w-48 h-48 md:w-64 md:h-64">
        <img
          src={avatarUrl ?? "/placeholder.svg"}
          alt={fullName ?? "Profile"}
          className="w-full h-full object-cover rounded-full border-4 border-rose shadow-lg"
        />
        {canEdit && (
          <label 
            htmlFor="avatar-upload" 
            className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <Camera className="w-6 h-6 text-burgundy" />
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
      </div>

      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-burgundy">
          {fullName || 'Anonyme'}
        </h1>
        {bio && (
          <p className="text-gray-600 max-w-2xl text-lg">{bio}</p>
        )}
      </div>
    </div>
  );
}