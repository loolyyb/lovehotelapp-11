
import { motion } from "framer-motion";
import { MessageCircle, TriangleAlert, Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    getConversationMessages,
    searchTerm,
    setSearchTerm,
    clearSearch
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

        <div className="mb-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#f3ebad]/60" />
            <Input
              placeholder="Rechercher dans les messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#f3ebad]/5 text-[#f3ebad] border-[#f3ebad]/20 focus:border-[#f3ebad]/40 focus:ring-[#f3ebad]/10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 text-[#f3ebad]/60 hover:text-[#f3ebad] hover:bg-[#f3ebad]/5"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-[#f3ebad]/70">
              {isLoading ? (
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Recherche en cours...
                </motion.span>
              ) : (
                <>Résultats pour "<span className="font-medium">{searchTerm}</span>" : {totalCount} message{totalCount !== 1 ? 's' : ''} trouvé{totalCount !== 1 ? 's' : ''}</>
              )}
            </p>
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
