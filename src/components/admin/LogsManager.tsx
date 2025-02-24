
import React from "react";
import { Card } from "@/components/ui/card";
import { ScrollText, Database, AlertTriangle } from "lucide-react";
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

export function LogsManager() {
  const { data: applicationLogs, isLoading: isLoadingAppLogs } = useQuery({
    queryKey: ["application_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("application_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  const { data: adminLogs, isLoading: isLoadingAdminLogs } = useQuery({
    queryKey: ["admin_audit_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  const isLoading = isLoadingAppLogs || isLoadingAdminLogs;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-gradient-to-br from-[#40192C] to-[#CE0067]/50 backdrop-blur-sm border-[#f3ebad]/20 hover:shadow-[0_0_30px_rgba(243,235,173,0.1)] transition-all duration-300">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-[#f3ebad]/10 w-fit">
            <ScrollText className="h-6 w-6 text-[#f3ebad]" />
          </div>
          <h2 className="text-2xl font-cormorant font-semibold text-[#f3ebad]">Logs d'audit</h2>
        </div>

        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-[#f3ebad]/70" />
              <h3 className="text-lg font-cormorant font-semibold text-[#f3ebad]">Logs Administrateurs</h3>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-[#f3ebad]/10">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#f3ebad]/10 hover:bg-[#f3ebad]/5">
                    <TableHead className="text-[#f3ebad]/70 font-montserrat">Date</TableHead>
                    <TableHead className="text-[#f3ebad]/70 font-montserrat">Action</TableHead>
                    <TableHead className="text-[#f3ebad]/70 font-montserrat">Type</TableHead>
                    <TableHead className="text-[#f3ebad]/70 font-montserrat">Détails</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center font-montserrat text-[#f3ebad]/50">
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          Chargement...
                        </motion.div>
                      </TableCell>
                    </TableRow>
                  ) : adminLogs && adminLogs.length > 0 ? (
                    adminLogs.map((log) => (
                      <TableRow key={log.id} className="border-b border-[#f3ebad]/10 hover:bg-[#f3ebad]/5 transition-colors">
                        <TableCell className="font-montserrat text-[#f3ebad]/70">
                          {format(new Date(log.created_at), "Pp", { locale: fr })}
                        </TableCell>
                        <TableCell className="font-montserrat text-[#f3ebad]">{log.action_type}</TableCell>
                        <TableCell className="font-montserrat text-[#f3ebad]/70">{log.target_type}</TableCell>
                        <TableCell>
                          <pre className="text-xs font-montserrat text-[#f3ebad]/50 bg-black/20 p-2 rounded">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center font-montserrat text-[#f3ebad]/50">
                        Aucun log administrateur
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-[#f3ebad]/70" />
              <h3 className="text-lg font-cormorant font-semibold text-[#f3ebad]">Logs Application</h3>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-[#f3ebad]/10">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#f3ebad]/10">
                    <TableHead className="text-[#f3ebad]/70 font-montserrat">Date</TableHead>
                    <TableHead className="text-[#f3ebad]/70 font-montserrat">Niveau</TableHead>
                    <TableHead className="text-[#f3ebad]/70 font-montserrat">Message</TableHead>
                    <TableHead className="text-[#f3ebad]/70 font-montserrat">Contexte</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center font-montserrat text-[#f3ebad]/50">
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          Chargement...
                        </motion.div>
                      </TableCell>
                    </TableRow>
                  ) : applicationLogs && applicationLogs.length > 0 ? (
                    applicationLogs.map((log) => (
                      <TableRow key={log.id} className="border-b border-[#f3ebad]/10 hover:bg-[#f3ebad]/5 transition-colors">
                        <TableCell className="font-montserrat text-[#f3ebad]/70">
                          {format(new Date(log.timestamp), "Pp", { locale: fr })}
                        </TableCell>
                        <TableCell className="font-montserrat text-[#f3ebad]">{log.level}</TableCell>
                        <TableCell className="font-montserrat text-[#f3ebad]/70">{log.message}</TableCell>
                        <TableCell>
                          <pre className="text-xs font-montserrat text-[#f3ebad]/50 bg-black/20 p-2 rounded">
                            {JSON.stringify(log.context, null, 2)}
                          </pre>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center font-montserrat text-[#f3ebad]/50">
                        Aucun log application
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
      </Card>
    </motion.div>
  );
}
