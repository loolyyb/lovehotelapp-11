import React from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

type ChartDataItem = {
  name: string;
  value: number;
};

type MotivationsChartProps = {
  data: ChartDataItem[];
};

export function MotivationsChart({ data }: MotivationsChartProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Top 10 des Motivations</h3>
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#7f1d1d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}