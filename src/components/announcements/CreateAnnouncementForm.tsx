
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useAuthSession } from "@/hooks/useAuthSession";

const formSchema = z.object({
  content: z.string().min(1, "Le contenu est requis"),
  image: z.instanceof(File).optional(),
});

export function CreateAnnouncementForm() {
  const { toast } = useToast();
  const { session } = useAuthSession();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session?.user) return;
    
    setIsLoading(true);
    try {
      let imageUrl = null;

      if (values.image) {
        const fileExt = values.image.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('announcements')
          .upload(filePath, values.image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('announcements')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error } = await supabase.from('announcements').insert({
        content: values.content,
        image_url: imageUrl,
        user_id: session.user.id
      });

      if (error) throw error;

      form.reset();
      toast({
        title: "Annonce publiée",
        description: "Votre annonce a été publiée avec succès",
      });
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la publication",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-burgundy/20 rounded-lg p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Partagez quelque chose..."
                    className="min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="flex items-center gap-4">
            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, ...field } }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onChange(file);
                        }}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        <ImagePlus className="h-4 w-4 mr-2" />
                        Ajouter une image
                      </Button>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Publication..." : "Publier"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
