
import React from 'react';
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Loader2 } from "lucide-react";

export function StatsManager() {
  const { data: userStats, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, account_status', { count: 'exact' });
      
      if (error) throw error;
      
      const stats = data.reduce((acc: any, curr) => {
        // Compter par rôle
        acc.roles = acc.roles || {};
        acc.roles[curr.role] = (acc.roles[curr.role] || 0) + 1;
        
        // Compter par statut
        acc.statuses = acc.statuses || {};
        acc.statuses[curr.account_status] = (acc.statuses[curr.account_status] || 0) + 1;
        
        return acc;
      }, {});

      return stats;
    }
  });

  const { data: eventStats, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['event-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('event_type, is_private', { count: 'exact' });
      
      if (error) throw error;

      return data.reduce((acc: any, curr) => {
        acc[curr.event_type] = (acc[curr.event_type] || 0) + 1;
        return acc;
      }, {});
    }
  });

  if (isLoadingUsers || isLoadingEvents) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const userRoleData = userStats?.roles ? Object.entries(userStats.roles).map(([name, value]) => ({
    name,
    value
  })) : [];

  const eventTypeData = eventStats ? Object.entries(eventStats).map(([name, value]) => ({
    name,
    value
  })) : [];

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Statistiques des utilisateurs</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={userRoleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Statistiques des événements</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={eventTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
