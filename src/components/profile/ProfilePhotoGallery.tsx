import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImagePlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
interface ProfilePhotoGalleryProps {
  photos?: string[] | null;
  onPhotosChange: (photos: string[]) => void;
}
export function ProfilePhotoGallery({
  photos = [],
  onPhotosChange
}: ProfilePhotoGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const {
    toast
  } = useToast();
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Vous devez sélectionner une image à uploader.");
      }
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      const {
        error: uploadError
      } = await supabase.storage.from('profile_photos').upload(filePath, file);
      if (uploadError) {
        throw uploadError;
      }
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from('profile_photos').getPublicUrl(filePath);
      const newPhotos = [...(photos || []), publicUrl];
      onPhotosChange(newPhotos);
      toast({
        title: "Succès",
        description: "La photo a été ajoutée à votre galerie."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter la photo. Veuillez réessayer."
      });
      console.error("Error uploading photo:", error.message);
    } finally {
      setUploading(false);
    }
  };
  const removePhoto = (indexToRemove: number) => {
    const newPhotos = (photos || []).filter((_, index) => index !== indexToRemove);
    onPhotosChange(newPhotos);
    toast({
      title: "Photo supprimée",
      description: "La photo a été retirée de votre galerie."
    });
  };
  return <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-200">Galerie photos</h2>
      <Card className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos?.map((photo, index) => <div key={index} className="relative aspect-square">
              <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
              <button onClick={() => removePhoto(index)} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-burgundy" />
              </button>
            </div>)}
          <label className="aspect-square flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-burgundy transition-colors">
            <div className="flex flex-col items-center space-y-2">
              <ImagePlus className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-500">Ajouter une photo</span>
            </div>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
      </Card>
    </div>;
}