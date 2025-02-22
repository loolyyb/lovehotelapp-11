
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { ImageUploadField } from "./components/ImageUploadField";
import { useAnnouncementForm } from "./hooks/useAnnouncementForm";

export function CreateAnnouncementForm() {
  const { session } = useAuthSession();
  const { form, isLoading, handleSubmit } = useAnnouncementForm();

  const onSubmit = form.handleSubmit((values) => handleSubmit(values, session));

  return (
    <div className="backdrop-blur-sm border border-burgundy/20 rounded-lg p-6 bg-[#911e55]">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
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
            <ImageUploadField form={form} />
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publication...
                </>
              ) : (
                "Publier"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
