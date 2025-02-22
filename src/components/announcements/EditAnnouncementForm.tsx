
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { AnnouncementWithRelations } from "@/hooks/useAnnouncements";

interface EditAnnouncementFormProps {
  announcement: AnnouncementWithRelations;
  onSubmit: (content: string, imageUrl?: string) => Promise<void>;
  onCancel: () => void;
}

export function EditAnnouncementForm({ announcement, onSubmit, onCancel }: EditAnnouncementFormProps) {
  const [content, setContent] = useState(announcement.content);
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(announcement.image_url);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "L'image ne doit pas dépasser 5Mo"
        });
        return;
      }
      setImage(file);
      setImageUrl(undefined);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImageUrl(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      let finalImageUrl = imageUrl;
      
      if (image) {
        setIsUploading(true);
        const filename = `${Date.now()}-${image.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from("announcements")
          .upload(filename, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("announcements")
          .getPublicUrl(filename);

        finalImageUrl = publicUrl;
        setIsUploading(false);
      }

      await onSubmit(content, finalImageUrl);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier l'annonce"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Modifier l'annonce</h2>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
      
      <div className="space-y-4">
        {(imageUrl || image) && (
          <div className="relative">
            <img
              src={image ? URL.createObjectURL(image) : imageUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="edit-image-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("edit-image-upload")?.click()}
          >
            <ImagePlus className="w-4 h-4 mr-2" />
            {image ? "Changer l'image" : "Ajouter une image"}
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || isUploading || !content.trim()} 
          className="bg-[#ce0067] hover:bg-[#ce0067]/90 text-white"
        >
          {(isSubmitting || isUploading) ? (
            <Loader className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
