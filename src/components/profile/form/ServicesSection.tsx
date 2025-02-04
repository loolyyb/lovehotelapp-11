import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { ConciergeFormData } from "@/types/concierge.types";

interface ServicesSectionProps {
  form: UseFormReturn<ConciergeFormData>;
}

export function ServicesSection({ form }: ServicesSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="decoration"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="!mt-0">Décoration personnalisée</FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="transport"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="!mt-0">Transport</FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="playlist"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="!mt-0">Playlist musicale</FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="romanticTable"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="!mt-0">Table dîner romantique isolé</FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customMenu"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="!mt-0">Menu sur mesure</FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customScenario"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="!mt-0">Scénario sur mesure</FormLabel>
          </FormItem>
        )}
      />
    </div>
  );
}