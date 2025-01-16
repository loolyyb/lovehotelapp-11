import { supabase } from "@/integrations/supabase/client";
import { EventFormValues } from "../types";

export const uploadEventImage = async (image: File): Promise<string | null> => {
  const fileExt = image.name.split('.').pop();
  const filePath = `${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('event_images')
    .upload(filePath, image);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('event_images')
    .getPublicUrl(filePath);

  return publicUrl;
};

export const combineDateTime = (date: string, time: string): Date => {
  const eventDateTime = new Date(date);
  const [hours, minutes] = time.split(':');
  eventDateTime.setHours(parseInt(hours), parseInt(minutes));
  return eventDateTime;
};

export const createEvent = async (values: EventFormValues, userId: string, imageUrl: string | null) => {
  const eventDateTime = combineDateTime(values.event_date, values.start_time);

  return await supabase.from('events').insert({
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
};