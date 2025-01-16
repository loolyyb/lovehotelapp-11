/**
 * StatsTab Component
 * 
 * Displays comprehensive statistics and metrics about the platform, including user interests,
 * event participation, daily activities, and top motivations.
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export function StatsTab() {
  // Fetch users and their preferences
  const { data: usersWithPreferences } = useQuery({
    queryKey: ['admin-users-preferences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          preferences (*)
        `);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch events and participations
  const { data: eventsData } = useQuery({
    queryKey: ['admin-events-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_participants (*)
        `);
      
      if (error) throw error;
      return data;
    }
  });

  // Calculate statistics
  const stats = {
    totalUsers: usersWithPreferences?.length || 0,
    openCurtainsInterested: usersWithPreferences?.filter(u => u.preferences?.open_curtains_interest)?.length || 0,
    speedDatingInterested: usersWithPreferences?.filter(u => u.preferences?.speed_dating_interest)?.length || 0,
    libertinePartyInterested: usersWithPreferences?.filter(u => u.preferences?.libertine_party_interest)?.length || 0,
    totalEvents: eventsData?.length || 0,
    totalParticipations: eventsData?.reduce((acc, event) => acc + (event.event_participants?.length || 0), 0) || 0,
  };

  // Calculate relationship type distribution
  const relationshipTypes = usersWithPreferences?.reduce((acc: any, user) => {
    if (user.relationship_type) {
      user.relationship_type.forEach((type: string) => {
        acc[type] = (acc[type] || 0) + 1;
      });
    }
    return acc;
  }, {});

  // Prepare data for the chart
  const chartData = relationshipTypes ? Object.entries(relationshipTypes).map(([name, value]) => ({
    name,
    value
  })) : [];

  // Sort chart data by value for top 10
  chartData.sort((a: any, b: any) => b.value - a.value);
  const top10Motivations = chartData.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* General Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Statistiques Générales</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Total Utilisateurs</h4>
            <p className="text-2xl text-burgundy">{stats.totalUsers}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Total Événements</h4>
            <p className="text-2xl text-burgundy">{stats.totalEvents}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Participations aux Événements</h4>
            <p className="text-2xl text-burgundy">{stats.totalParticipations}</p>
          </div>
        </div>
      </Card>

      {/* Interest Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Statistiques des Intérêts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Intéressés Rideaux Ouverts</h4>
            <p className="text-2xl text-burgundy">{stats.openCurtainsInterested}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Intéressés Speed Dating</h4>
            <p className="text-2xl text-burgundy">{stats.speedDatingInterested}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Intéressés Soirées Libertines</h4>
            <p className="text-2xl text-burgundy">{stats.libertinePartyInterested}</p>
          </div>
        </div>
      </Card>

      {/* Top 10 Motivations Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top 10 des Motivations</h3>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top10Motivations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#7f1d1d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Detailed Statistics Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Statistiques Détaillées</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type de Motivation</TableHead>
              <TableHead>Nombre d'Utilisateurs</TableHead>
              <TableHead>Pourcentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chartData.map((item: any) => (
              <TableRow key={item.name}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.value}</TableCell>
                <TableCell>
                  {((item.value / stats.totalUsers) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}