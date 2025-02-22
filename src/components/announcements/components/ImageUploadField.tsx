
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

interface ImageUploadFieldProps {
  form: UseFormReturn<any>;
}

export function ImageUploadField({ form }: ImageUploadFieldProps) {
  return (
    <FormField
      control={form.control}
      name="images"
      render={({ field: { onChange, value, ...field } }) => (
        <FormItem>
          <FormControl>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                id="image-upload"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) onChange(files);
                }}
                {...field}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                Ajouter des images
              </Button>
              {value && (
                <span className="text-sm text-zinc-200">
                  {Array.from(value as FileList).length} image(s) sélectionnée(s)
                </span>
              )}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
