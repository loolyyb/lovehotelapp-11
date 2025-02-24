
import { supabase } from "@/integrations/supabase/client";
import { EventFormValues } from "../types";
import { toast } from "@/hooks/use-toast";

export const uploadEventImage = async (image: File): Promise<string | null> => {
  try {
    const fileExt = image.name.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('event_images')
      .upload(filePath, image);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      toast({
        title: "Erreur",
        description: "L'image n'a pas pu être téléchargée",
        variant: "destructive",
      });
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('event_images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadEventImage:', error);
    return null;
  }
};

export const combineDateTime = (date: string, time: string): Date => {
  const eventDateTime = new Date(date);
  const [hours, minutes] = time.split(':');
  eventDateTime.setHours(parseInt(hours), parseInt(minutes));
  return eventDateTime;
};
