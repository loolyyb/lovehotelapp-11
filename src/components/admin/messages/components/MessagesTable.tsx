
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MessagesTableProps {
  messages: any[];
  isLoading: boolean;
  markAsRead: (messageId: string) => Promise<void>;
}

export function MessagesTable({ messages, isLoading, markAsRead }: MessagesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-[#f3ebad]/10">
          <TableHead className="text-[#f3ebad]/70 font-montserrat">Date</TableHead>
          <TableHead className="text-[#f3ebad]/70 font-montserrat">De</TableHead>
          <TableHead className="text-[#f3ebad]/70 font-montserrat">À</TableHead>
          <TableHead className="text-[#f3ebad]/70 font-montserrat">Message</TableHead>
          <TableHead className="text-[#f3ebad]/70 font-montserrat">État</TableHead>
          <TableHead className="text-[#f3ebad]/70 font-montserrat">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell
              colSpan={6}
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
              <TableCell className="font-montserrat text-[#f3ebad]">
                {message.recipient?.username || message.recipient?.full_name || 'Utilisateur inconnu'}
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
              colSpan={6}
              className="text-center font-montserrat text-[#f3ebad]/50"
            >
              Aucun message
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
