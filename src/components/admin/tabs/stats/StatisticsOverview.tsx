import React from "react";
import { Card } from "@/components/ui/card";

type StatisticsOverviewProps = {
  totalUsers: number;
  totalEvents: number;
  totalParticipations: number;
};

export function StatisticsOverview({ 
  totalUsers, 
  totalEvents, 
  totalParticipations 
}: StatisticsOverviewProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Statistiques Générales</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold mb-2">Total Utilisateurs</h4>
          <p className="text-2xl text-burgundy">{totalUsers}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold mb-2">Total Événements</h4>
          <p className="text-2xl text-burgundy">{totalEvents}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold mb-2">Participations aux Événements</h4>
          <p className="text-2xl text-burgundy">{totalParticipations}</p>
        </div>
      </div>
    </Card>
  );
}