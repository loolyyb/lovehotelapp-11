
import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  message: z.string().min(1, "Le message est requis"),
  target_url: z.string().url().optional().or(z.literal("")),
  icon_url: z.string().url().optional().or(z.literal("")),
  target_motivation: z.string().optional(),
});

export function PushNotificationsTab() {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      message: "",
      target_url: "",
      icon_url: "",
      target_motivation: "",
    },
  });

  // Récupérer le nombre de souscriptions
  const { data: subscriptionCount } = useQuery({
    queryKey: ["push-subscriptions-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("push_subscriptions")
        .select('*', { count: 'exact', head: true });
      
      return count;
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSending(true);

      // Créer la notification dans la base de données avec tous les champs requis
      const { error: dbError } = await supabase.from("push_notifications").insert({
        title: values.title,
        message: values.message,
        icon_url: values.icon_url || null,
        target_url: values.target_url || null,
        target_motivation: values.target_motivation || null,
        status: "pending" as const,
        created_at: new Date().toISOString(),
      });

      if (dbError) throw dbError;

      // Déclencher l'envoi des notifications via la fonction edge
      const { error: functionError } = await supabase.functions.invoke(
        "send-push-notification",
        {
          body: values,
        }
      );

      if (functionError) throw functionError;

      toast({
        title: "Notification envoyée",
        description: "La notification push a été envoyée avec succès",
      });

      form.reset();
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          "Une erreur est survenue lors de l'envoi de la notification",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Notifications Push</h2>
          <p className="text-sm text-muted-foreground">
            Envoyez des notifications push aux utilisateurs qui ont activé les
            notifications.
          </p>
          {typeof subscriptionCount === "number" && (
            <p className="text-sm font-medium">
              {subscriptionCount} utilisateur
              {subscriptionCount > 1 ? "s" : ""} inscrit
              {subscriptionCount > 1 ? "s" : ""} aux notifications push
            </p>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Titre de la notification" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Message de la notification"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de destination (optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      placeholder="https://example.com"
                    />
                  </FormControl>
                  <FormDescription>
                    L'URL vers laquelle l'utilisateur sera redirigé en cliquant
                    sur la notification
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de l'icône (optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      placeholder="https://example.com/icon.png"
                    />
                  </FormControl>
                  <FormDescription>
                    L'URL de l'icône qui sera affichée dans la notification
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSending}>
              {isSending ? "Envoi en cours..." : "Envoyer la notification"}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
