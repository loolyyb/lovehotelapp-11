
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface PushNotificationsManagerProps {
  session: Session;
}

export function PushNotificationsManager({ session }: PushNotificationsManagerProps) {
  const { toast } = useToast();
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [targetUrl, setTargetUrl] = React.useState("");

  const { data: subscriptions } = useQuery({
    queryKey: ['push-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: notifications } = useQuery({
    queryKey: ['push-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('push_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !message) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le titre et le message sont requis",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('push_notifications')
        .insert([
          {
            title,
            message,
            target_url: targetUrl || null,
            created_by: session.user.id,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La notification a été envoyée avec succès",
      });

      setTitle("");
      setMessage("");
      setTargetUrl("");
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la notification",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Envoyer une notification push</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Titre
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la notification"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Message
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Contenu de la notification"
              required
            />
          </div>

          <div>
            <label htmlFor="targetUrl" className="block text-sm font-medium mb-1">
              URL de redirection (optionnel)
            </label>
            <Input
              id="targetUrl"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {subscriptions?.length || 0} utilisateurs inscrits aux notifications
            </p>
            <Button type="submit">
              Envoyer la notification
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Historique des notifications</h3>
        <div className="space-y-4">
          {notifications?.map((notification) => (
            <div key={notification.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{notification.title}</h4>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  {notification.target_url && (
                    <a 
                      href={notification.target_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-500 hover:underline"
                    >
                      {notification.target_url}
                    </a>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(notification.created_at).toLocaleString()}
                </span>
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <span className={`text-sm px-2 py-1 rounded ${
                  notification.status === 'sent' 
                    ? 'bg-green-100 text-green-800'
                    : notification.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {notification.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
