import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { EventFormValues } from "../../types";

interface BasicInfoFieldsProps {
  form: UseFormReturn<EventFormValues>;
}

export function BasicInfoFields({ form }: BasicInfoFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Titre</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                className="border-2 border-gray-200 focus:border-primary hover:border-gray-300 transition-colors"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                className="min-h-[100px] border-2 border-gray-200 focus:border-primary hover:border-gray-300 transition-colors"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="image"
        render={({ field: { value, onChange, ...field } }) => (
          <FormItem>
            <FormLabel>Image de l'événement</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                    }
                  }}
                  className="border-2 border-gray-200 focus:border-primary hover:border-gray-300 transition-colors"
                  {...field}
                />
                {value && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                    <ImageIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{value.name}</span>
                  </div>
                )}
              </div>
            </FormControl>
            <FormDescription>
              Format recommandé : paysage, 1600x900 pixels maximum
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}