/**
 * UsersTab Component
 * 
 * Displays a list of all users in the system and provides administrative
 * functions to manage user accounts. Includes features for viewing user details,
 * managing roles, and monitoring user activity.
 */
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

export function UsersTab() {
  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <Card className="data-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs font-medium text-admin-text uppercase tracking-wider">ID</TableHead>
            <TableHead className="text-xs font-medium text-admin-text uppercase tracking-wider">Nom</TableHead>
            <TableHead className="text-xs font-medium text-admin-text uppercase tracking-wider">User ID</TableHead>
            <TableHead className="text-xs font-medium text-admin-text uppercase tracking-wider">Rôle</TableHead>
            <TableHead className="text-xs font-medium text-admin-text uppercase tracking-wider">Créé le</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id} className="bg-admin-card hover:bg-admin-bg/50">
              <TableCell className="whitespace-nowrap">{user.id}</TableCell>
              <TableCell className="whitespace-nowrap">{user.full_name}</TableCell>
              <TableCell className="whitespace-nowrap">{user.user_id}</TableCell>
              <TableCell className="whitespace-nowrap">{user.role}</TableCell>
              <TableCell className="whitespace-nowrap">{new Date(user.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}