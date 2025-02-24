
import React from "react";
import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
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
import { motion } from "framer-motion";

export function MessagesManager() {
  const { data: messages, isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          conversations!inner (
            user1_id,
            user2_id,
            sender_profile:profiles!user1_id (
              username,
              full_name
            ),
            receiver_profile:profiles!user2_id (
              username,
              full_name
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-gradient-to-br from-[#40192C] to-[#CE0067]/50 backdrop-blur-sm border-[#f3ebad]/20 hover:shadow-[0_0_30px_rgba(243,235,173,0.1)] transition-all duration-300">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-[#f3ebad]/10 w-fit">
            <MessageCircle className="h-6 w-6 text-[#f3ebad]" />
          </div>
          <h2 className="text-2xl font-cormorant font-semibold text-[#f3ebad]">
            Messages
          </h2>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-[#f3ebad]/10">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#f3ebad]/10">
                <TableHead className="text-[#f3ebad]/70 font-montserrat">Date</TableHead>
                <TableHead className="text-[#f3ebad]/70 font-montserrat">De</TableHead>
                <TableHead className="text-[#f3ebad]/70 font-montserrat">À</TableHead>
                <TableHead className="text-[#f3ebad]/70 font-montserrat">Message</TableHead>
                <TableHead className="text-[#f3ebad]/70 font-montserrat">État</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center font-montserrat text-[#f3ebad]/50"
                  >
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Chargement...
                    </motion.div>
                  </TableCell>
                </TableRow>
              ) : messages && messages.length > 0 ? (
                messages.map((message) => {
                  const senderProfile = message.sender_id === message.conversations.user1_id
                    ? message.conversations.sender_profile
                    : message.conversations.receiver_profile;
                  
                  const receiverProfile = message.sender_id === message.conversations.user1_id
                    ? message.conversations.receiver_profile
                    : message.conversations.sender_profile;

                  return (
                    <TableRow
                      key={message.id}
                      className="border-b border-[#f3ebad]/10 hover:bg-[#f3ebad]/5 transition-colors"
                    >
                      <TableCell className="font-montserrat text-[#f3ebad]/70">
                        {format(new Date(message.created_at), "Pp", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell className="font-montserrat text-[#f3ebad]">
                        {senderProfile.username || senderProfile.full_name}
                      </TableCell>
                      <TableCell className="font-montserrat text-[#f3ebad]">
                        {receiverProfile.username || receiverProfile.full_name}
                      </TableCell>
                      <TableCell className="font-montserrat text-[#f3ebad]/70">
                        {message.content}
                      </TableCell>
                      <TableCell className="font-montserrat text-[#f3ebad]/70">
                        {message.read_at ? (
                          <span className="text-green-400">Lu</span>
                        ) : (
                          <span className="text-[#f3ebad]/50">Non lu</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center font-montserrat text-[#f3ebad]/50"
                  >
                    Aucun message
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </motion.div>
  );
}
