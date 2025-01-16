import React from "react";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function ConversationsTab() {
  const { data: conversations } = useQuery({
    queryKey: ["admin-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          user1:profiles!conversations_user1_profile_fkey(username, full_name),
          user2:profiles!conversations_user2_profile_fkey(username, full_name),
          messages(count)
        `)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Modération des conversations</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2">Utilisateur 1</th>
              <th className="text-left p-2">Utilisateur 2</th>
              <th className="text-left p-2">Messages</th>
              <th className="text-left p-2">Statut</th>
              <th className="text-left p-2">Dernière activité</th>
            </tr>
          </thead>
          <tbody>
            {conversations?.map((conv) => (
              <tr key={conv.id} className="border-t">
                <td className="p-2">{conv.user1?.username || conv.user1?.full_name}</td>
                <td className="p-2">{conv.user2?.username || conv.user2?.full_name}</td>
                <td className="p-2">{conv.messages?.[0]?.count || 0}</td>
                <td className="p-2">{conv.status}</td>
                <td className="p-2">
                  {new Date(conv.updated_at).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}