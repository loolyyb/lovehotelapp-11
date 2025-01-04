import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Heart, Users, User } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RelationshipStatusIcon } from "./RelationshipStatusIcon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const getOrientationLabel = (orientation: string | null) => {
    switch (orientation) {
      case "straight":
        return "Hétérosexuel(le)";
      case "gay":
        return "Homosexuel(le)";
      case "bisexual":
        return "Bisexuel(le)";
      case "pansexual":
        return "Pansexuel(le)";
      default:
        return "Non spécifié";
    }
  };

  const getSeekingLabel = (value: string) => {
    switch (value) {
      case "single_man":
        return { label: "Un homme", icon: <User className="w-4 h-4" /> };
      case "single_woman":
        return { label: "Une femme", icon: <User className="w-4 h-4" /> };
      case "couple_mf":
        return { label: "Un couple (homme-femme)", icon: <Users className="w-4 h-4" /> };
      case "couple_mm":
        return { label: "Un couple (homme-homme)", icon: <Users className="w-4 h-4" /> };
      case "couple_ff":
        return { label: "Un couple (femme-femme)", icon: <Users className="w-4 h-4" /> };
      default:
        return { label: value, icon: <User className="w-4 h-4" /> };
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
        <h1 className="text-3xl md:text-4xl font-bold text-burgundy font-cormorant">
          {fullName || 'Anonyme'}
        </h1>

        <div className="flex items-center justify-center space-x-4">
          {relationshipType && relationshipType.length > 0 && (
            <RelationshipStatusIcon type={relationshipType[0] as "casual" | "serious" | "libertine" | null} />
          )}
          
          {sexualOrientation && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="bg-rose/20 rounded-full p-2">
                    <Heart className="w-5 h-5 text-burgundy" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getOrientationLabel(sexualOrientation)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {seeking && seeking.length > 0 && (
            <div className="flex gap-2">
              {seeking.map((item, index) => {
                const { label, icon } = getSeekingLabel(item);
                return (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="bg-rose/20 rounded-full p-2">
                          {icon}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Recherche : {label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          )}
        </div>

        {bio && (
          <p className="text-gray-600 max-w-2xl text-lg font-montserrat">{bio}</p>
        )}
      </div>
    </div>
  );
}
