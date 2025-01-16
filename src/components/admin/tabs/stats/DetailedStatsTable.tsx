import React from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TableDataItem = {
  name: string;
  value: number;
};

type DetailedStatsTableProps = {
  data: TableDataItem[];
  totalUsers: number;
};

export function DetailedStatsTable({ data, totalUsers }: DetailedStatsTableProps) {
  return (
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
          {data.map((item) => (
            <TableRow key={item.name}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.value}</TableCell>
              <TableCell>
                {((item.value / totalUsers) * 100).toFixed(1)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}