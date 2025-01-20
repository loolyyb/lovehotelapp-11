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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500';
    case 'in_progress':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-green-500';
    case 'cancelled':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

export function RequestsTab() {
  const { data: requests } = useQuery({
    queryKey: ['admin-concierge-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('concierge_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Demandes de conciergerie</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Type d'expérience</TableHead>
            <TableHead>Date souhaitée</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests?.map((request) => (
            <TableRow key={request.id} className="hover:bg-muted/50">
              <TableCell>
                {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm')}
              </TableCell>
              <TableCell>
                {request.first_name} {request.last_name}
              </TableCell>
              <TableCell>
                <div>{request.email}</div>
                {request.phone && <div className="text-sm text-muted-foreground">{request.phone}</div>}
              </TableCell>
              <TableCell>{request.experience_type}</TableCell>
              <TableCell>
                {format(new Date(request.event_date), 'dd/MM/yyyy HH:mm')}
              </TableCell>
              <TableCell>
                <Badge className={`${getStatusColor(request.status)}`}>
                  {request.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}