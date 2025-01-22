import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function NotificationsTab() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [targetAudience, setTargetAudience] = useState<string>("all");
  const [targetMotivation, setTargetMotivation] = useState<string>("all");
  const [targetUrl, setTargetUrl] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    console.log("Sending notification:", { 
      title, 
      message, 
      iconUrl, 
      targetAudience,
      targetMotivation,
      targetUrl 
    });

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile) {
        throw new Error("Profile not found");
      }

      const { data, error } = await supabase
        .from('push_notifications')
        .insert([
          {
            title,
            message,
            icon_url: iconUrl,
            status: 'pending',
            created_by: (await supabase.auth.getUser()).data.user?.id,
            target_audience: targetAudience,
            target_motivation: targetMotivation,
            target_url: targetUrl
          }
        ])
        .select();

      console.log("Insert response:", { data, error });

      if (error) throw error;

      toast({
        title: "Notification créée",
        description: "La notification a été enregistrée et sera envoyée aux utilisateurs.",
      });

      // Reset form
      setTitle("");
      setMessage("");
      setIconUrl("");
      setTargetAudience("all");
      setTargetMotivation("all");
      setTargetUrl("");
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la notification. Veuillez vérifier vos permissions.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Notifications Push</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="targetAudience" className="text-sm font-medium">
            Audience cible
          </label>
          <Select
            value={targetAudience}
            onValueChange={setTargetAudience}
          >
            <SelectTrigger className="w-full bg-white text-gray-900">
              <SelectValue placeholder="Sélectionnez l'audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les utilisateurs</SelectItem>
              <SelectItem value="casual">Relations occasionnelles</SelectItem>
              <SelectItem value="serious">Relations sérieuses</SelectItem>
              <SelectItem value="libertine">Relations libertines</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="targetMotivation" className="text-sm font-medium">
            Motivation cible
          </label>
          <Select
            value={targetMotivation}
            onValueChange={setTargetMotivation}
          >
            <SelectTrigger className="w-full bg-white text-gray-900">
              <SelectValue placeholder="Sélectionnez la motivation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les motivations</SelectItem>
              <SelectItem value="bdsm">BDSM</SelectItem>
              <SelectItem value="rideaux_ouverts">Rideaux ouverts</SelectItem>
              <SelectItem value="speed_dating">Speed dating</SelectItem>
              <SelectItem value="libertinage">Libertinage</SelectItem>
              <SelectItem value="gastronomie">Gastronomie</SelectItem>
              <SelectItem value="jacuzzi">Jacuzzi</SelectItem>
              <SelectItem value="art">Art</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Titre de la notification
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entrez le titre..."
            required
            className="bg-white text-gray-900 placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium">
            Message
          </label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Entrez le message..."
            required
            className="bg-white text-gray-900 placeholder:text-gray-500 min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="targetUrl" className="text-sm font-medium">
            URL de redirection
          </label>
          <Input
            id="targetUrl"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://..."
            className="bg-white text-gray-900 placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="iconUrl" className="text-sm font-medium">
            URL de l'icône (optionnel)
          </label>
          <Input
            id="iconUrl"
            value={iconUrl}
            onChange={(e) => setIconUrl(e.target.value)}
            placeholder="https://..."
            className="bg-white text-gray-900 placeholder:text-gray-500"
          />
        </div>

        <Button 
          type="submit" 
          disabled={isSending} 
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            "Envoyer la notification"
          )}
        </Button>
      </form>
    </div>
  );
}