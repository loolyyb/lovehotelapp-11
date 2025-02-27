
import { motion } from "framer-motion";
import { MessageCircle, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MessagesTable } from "./components/MessagesTable";
import { MessagesPagination } from "./components/MessagesPagination";
import { useMessagesManagement } from "./hooks/useMessagesManagement";
import { detectSuspiciousKeywords } from "./utils/keywordDetection";

export function MessagesManager() {
  const {
    messages,
    totalCount,
    totalPages,
    currentPage,
    setCurrentPage,
    isLoading,
    markAsRead,
    getConversationMessages
  } = useMessagesManagement();

  // Compter les messages avec des mots-clés suspects
  const suspiciousCount = messages.filter(
    message => detectSuspiciousKeywords(message.content).hasSuspiciousKeywords
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-gradient-to-br from-[#40192C] to-[#CE0067]/50 backdrop-blur-sm border-[#f3ebad]/20 hover:shadow-[0_0_30px_rgba(243,235,173,0.1)] transition-all duration-300">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#f3ebad]/10 w-fit">
              <MessageCircle className="h-6 w-6 text-[#f3ebad]" />
            </div>
            <h2 className="text-2xl font-cormorant font-semibold text-[#f3ebad]">
              Messages ({totalCount})
            </h2>
          </div>
          
          {suspiciousCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-950/30 text-amber-400 px-3 py-1.5 rounded-md">
              <TriangleAlert className="h-5 w-5" />
              <span className="font-medium">{suspiciousCount} message{suspiciousCount > 1 ? 's' : ''} suspect{suspiciousCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-[#f3ebad]/10">
          <MessagesTable 
            messages={messages}
            isLoading={isLoading}
            markAsRead={markAsRead}
            getConversationMessages={getConversationMessages}
          />
          
          <MessagesPagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </Card>
    </motion.div>
  );
}
