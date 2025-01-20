import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ConciergeFormData } from "@/types/concierge.types";

interface AboutSectionProps {
  form: UseFormReturn<ConciergeFormData>;
}

export function AboutSection({ form }: AboutSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description de votre idée</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Décrivez votre idée en détail..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              N'hésitez pas à être précis dans vos envies
            </FormDescription>
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prénom</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Téléphone (facultatif)</FormLabel>
            <FormControl>
              <Input type="tel" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}