import React from "react";
import { Card } from "@/components/ui/card";
import { ScrollText } from "lucide-react";
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
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <ScrollText className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Logs d'audit</h2>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Logs Administrateurs</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Détails</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : adminLogs && adminLogs.length > 0 ? (
                adminLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.created_at), "Pp", { locale: fr })}
                    </TableCell>
                    <TableCell>{log.action_type}</TableCell>
                    <TableCell>{log.target_type}</TableCell>
                    <TableCell>
                      <pre className="text-xs">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Aucun log administrateur
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Logs Application</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Contexte</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : applicationLogs && applicationLogs.length > 0 ? (
                applicationLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.timestamp), "Pp", { locale: fr })}
                    </TableCell>
                    <TableCell>{log.level}</TableCell>
                    <TableCell>{log.message}</TableCell>
                    <TableCell>
                      <pre className="text-xs">
                        {JSON.stringify(log.context, null, 2)}
                      </pre>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Aucun log application
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}