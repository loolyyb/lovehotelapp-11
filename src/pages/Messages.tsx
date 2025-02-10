import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  conversation_id: string;
  read_at: string | null;
}

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          navigate("/login");
          return;
        }

        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching messages:", error);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de charger les messages",
          });
          return;
        }

        setMessages(data || []);
      } catch (error) {
        console.error("Error:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Mettre en place un écouteur en temps réel pour les nouveaux messages
    const subscription = supabase
      .channel("messages_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          setMessages((current) => [payload.new as Message, ...current]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-burgundy" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-burgundy">Messages</h1>
      <div className="space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">Aucun message</p>
        ) : (
          messages.map((message) => (
            <Card key={message.id} className="p-4">
              <p className="text-sm text-gray-600">
                {new Date(message.created_at).toLocaleString()}
              </p>
              <p className="mt-2">{message.content}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
