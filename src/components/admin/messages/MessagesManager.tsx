
import React, { useState } from "react";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const MESSAGES_PER_PAGE = 10;

export function MessagesManager() {
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-messages", currentPage],
    queryFn: async () => {
      console.log("Fetching messages for page:", currentPage);
      
      // First, get total count
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true });

      // Then get paginated data with sender information
      const { data: messages, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(username, full_name, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * MESSAGES_PER_PAGE, currentPage * MESSAGES_PER_PAGE - 1);

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }
      
      console.log("Messages data:", { messages, totalCount: count });
      return { messages, totalCount: count };
    },
  });

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId);
      
      if (error) throw error;
      
      toast({
        title: "Message marqué comme lu",
        description: "Le statut du message a été mis à jour"
      });
      
      refetch();
    } catch (error) {
      console.error("Error marking message as read:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de marquer le message comme lu"
      });
    }
  };

  const messages = data?.messages || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / MESSAGES_PER_PAGE);

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
            Messages ({totalCount})
          </h2>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-[#f3ebad]/10">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#f3ebad]/10">
                <TableHead className="text-[#f3ebad]/70 font-montserrat">Date</TableHead>
                <TableHead className="text-[#f3ebad]/70 font-montserrat">De</TableHead>
                <TableHead className="text-[#f3ebad]/70 font-montserrat">Message</TableHead>
                <TableHead className="text-[#f3ebad]/70 font-montserrat">État</TableHead>
                <TableHead className="text-[#f3ebad]/70 font-montserrat">Actions</TableHead>
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
              ) : messages.length > 0 ? (
                messages.map((message: any) => (
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
                      {message.sender?.username || message.sender?.full_name || 'Utilisateur inconnu'}
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
                    <TableCell>
                      {!message.read_at && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-[#f3ebad]/70 hover:text-[#f3ebad] border-[#f3ebad]/30"
                          onClick={() => markAsRead(message.id)}
                        >
                          Marquer comme lu
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
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

          {totalPages > 1 && (
            <div className="mt-4 pb-2">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={`text-[#f3ebad] hover:text-[#f3ebad]/80 ${
                        currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                      }`}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                        className={`text-[#f3ebad] hover:text-[#f3ebad]/80 ${
                          currentPage === i + 1 ? 'bg-[#f3ebad]/20' : ''
                        }`}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={`text-[#f3ebad] hover:text-[#f3ebad]/80 ${
                        currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
