
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: number | string;
  trend?: string;
  bgClass?: string;
  chartData?: any[];
}

export function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  trend, 
  bgClass = "bg-[#40192C]",
  chartData
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className={`p-6 h-full ${bgClass} backdrop-blur-sm border-[#f3ebad]/20 group hover:shadow-[0_0_30px_rgba(243,235,173,0.1)] transition-all duration-300`}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="p-2 rounded-lg bg-[#f3ebad]/10 w-fit">
              <Icon className="w-5 h-5 text-[#f3ebad]" />
            </div>
            <h3 className="text-sm font-montserrat text-[#f3ebad]/70">{title}</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-cormorant font-bold text-[#f3ebad]">
                {value}
              </p>
              {trend && (
                <span className="text-xs text-green-400">
                  {trend}
                </span>
              )}
            </div>
          </div>
          {chartData && (
            <div className="w-24 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f3ebad" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f3ebad" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#f3ebad"
                    fillOpacity={1}
                    fill="url(#colorCount)"
                  />
                  <Tooltip />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        {trend && (
          <Progress 
            value={70} 
            className="mt-4 h-1 [&>div]:bg-[#f3ebad] bg-[#f3ebad]/10" 
          />
        )}
      </Card>
    </motion.div>
  );
}
