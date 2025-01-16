import React from "react";
import { Card } from "@/components/ui/card";

type InterestStatisticsProps = {
  openCurtainsInterested: number;
  speedDatingInterested: number;
  libertinePartyInterested: number;
};

export function InterestStatistics({
  openCurtainsInterested,
  speedDatingInterested,
  libertinePartyInterested
}: InterestStatisticsProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Statistiques des Intérêts</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold mb-2">Intéressés Rideaux Ouverts</h4>
          <p className="text-2xl text-burgundy">{openCurtainsInterested}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold mb-2">Intéressés Speed Dating</h4>
          <p className="text-2xl text-burgundy">{speedDatingInterested}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold mb-2">Intéressés Soirées Libertines</h4>
          <p className="text-2xl text-burgundy">{libertinePartyInterested}</p>
        </div>
      </div>
    </Card>
  );
}