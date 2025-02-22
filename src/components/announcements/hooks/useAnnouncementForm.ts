
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

const formSchema = z.object({
  content: z.string().min(1, "Le contenu est requis"),
  images: z.instanceof(FileList).optional(),
});

export function useAnnouncementForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    }
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>, session: Session | null) => {
    if (!session?.user) {
      toast({
        variant: "destructive",
        title: "Non autorisé",
        description: "Vous devez être connecté pour publier une annonce"
      });
      return;
    }
    
    setIsLoading(true);

    try {
      let mainImageUrl = null;
      const additionalImageUrls = [];
      const files = Array.from(values.images || []);

      // Upload main image first if exists
      if (files.length > 0) {
        const mainFile = files[0];
        const fileExt = mainFile.name.split('.').pop();
        const mainFilePath = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('announcements')
          .upload(mainFilePath, mainFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('announcements')
          .getPublicUrl(mainFilePath);

        mainImageUrl = publicUrl;
      }

      // Create the announcement
      const { data: announcement, error: announcementError } = await supabase
        .from('announcements')
        .insert({
          content: values.content,
          image_url: mainImageUrl,
          user_id: session.user.id
        })
        .select()
        .single();

      if (announcementError) throw announcementError;

      // Upload additional images if any
      if (files.length > 1) {
        for (let i = 1; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const filePath = `${crypto.randomUUID()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('announcements')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('announcements')
            .getPublicUrl(filePath);

          additionalImageUrls.push(publicUrl);
        }

        // Insert additional images
        if (additionalImageUrls.length > 0) {
          const { error: imagesError } = await supabase
            .from('announcement_images')
            .insert(
              additionalImageUrls.map(url => ({
                announcement_id: announcement.id,
                image_url: url
              }))
            );

          if (imagesError) throw imagesError;
        }
      }

      form.reset();
      toast({
        title: "Annonce publiée",
        description: "Votre annonce a été publiée avec succès"
      });
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la publication"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    handleSubmit
  };
}
