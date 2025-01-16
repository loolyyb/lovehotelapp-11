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

export const createEvent = async (values: EventFormValues, userId: string, imageUrl: string | null) => {
  const eventDateTime = combineDateTime(values.event_date, values.start_time);

  try {
    const { error } = await supabase.from('events').insert({
      title: values.title,
      description: values.description,
      event_date: eventDateTime.toISOString(),
      event_type: values.event_type,
      created_by: userId,
      is_private: values.is_private,
      price: values.free_for_members ? null : values.price,
      free_for_members: values.free_for_members,
      image_url: imageUrl,
    });

    if (error) throw error;

    toast({
      title: "Succès",
      description: "L'événement a été créé avec succès",
    });

    return { error: null };
  } catch (error) {
    console.error('Error creating event:', error);
    toast({
      title: "Erreur",
      description: "Une erreur est survenue lors de la création de l'événement",
      variant: "destructive",
    });
    return { error };
  }
};