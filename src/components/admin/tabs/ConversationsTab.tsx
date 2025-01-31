import React from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MessageWithProfiles {
  id: string;
  content: string | null;
  created_at: string;
  read_at: string | null;
  sender_id: string;
  conversation_id: string;
  sender: {
    full_name: string | null;
    username: string | null;
  } | null;
  conversation: {
    user1: {
      full_name: string | null;
      username: string | null;
    } | null;
    user2: {
      full_name: string | null;
      username: string | null;
    } | null;
  } | null;
}

export function ConversationsTab() {
  const { data: messages, isLoading } = useQuery<MessageWithProfiles[]>({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      console.log("Fetching messages for admin view");
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read_at,
          sender_id,
          conversation_id,
          sender:profiles(full_name, username),
          conversation:conversations(
            user1:profiles!conversations_user1_profile_fkey(full_name, username),
            user2:profiles!conversations_user2_profile_fkey(full_name, username)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }
      console.log("Fetched messages:", data);
      return data as MessageWithProfiles[];
    }
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">Chargement des messages...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>De</TableHead>
            <TableHead>À</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages?.map((message) => {
            const sender = message.sender?.full_name || message.sender?.username || message.sender_id;
            const user1Name = message.conversation?.user1?.full_name || message.conversation?.user1?.username;
            const user2Name = message.conversation?.user2?.full_name || message.conversation?.user2?.username;
            const recipient = user1Name === sender ? user2Name : user1Name;

            return (
              <TableRow key={message.id}>
                <TableCell className="font-medium">{sender}</TableCell>
                <TableCell>{recipient}</TableCell>
                <TableCell className="max-w-md truncate">
                  {message.content}
                </TableCell>
                <TableCell>
                  {format(new Date(message.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                </TableCell>
                <TableCell>
                  {message.read_at ? (
                    <span className="text-green-600">Lu</span>
                  ) : (
                    <span className="text-yellow-600">Non lu</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}