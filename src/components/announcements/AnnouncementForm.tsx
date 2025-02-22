
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AnnouncementFormProps {
  onSubmit: (content: string, imageUrl?: string) => Promise<void>;
}

export function AnnouncementForm({ onSubmit }: AnnouncementFormProps) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      let imageUrl = "";
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

        imageUrl = publicUrl;
        setIsUploading(false);
      }

      await onSubmit(content, imageUrl);
      setContent("");
      setImage(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de publier l'annonce"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg shadow">
      <Textarea
        placeholder="Partagez quelque chose avec la communauté..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px]"
      />
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="image-upload"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("image-upload")?.click()}
          >
            <ImagePlus className="w-4 h-4 mr-2" />
            {image ? "Image sélectionnée" : "Ajouter une image"}
          </Button>
        </div>
        <Button 
          type="submit" 
          disabled={isSubmitting || isUploading || !content.trim()} 
          className="bg-[#ce0067] hover:bg-[#ce0067]/90"
        >
          {(isSubmitting || isUploading) ? (
            <Loader className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          Publier
        </Button>
      </div>
    </form>
  );
}
