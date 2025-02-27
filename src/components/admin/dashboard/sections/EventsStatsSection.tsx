
import { AdminStats } from "@/types/admin.types";
import { CalendarIcon, CalendarDaysIcon, ChartBarIcon } from "lucide-react";
import { StatCard } from "../components/StatCard";

interface EventsStatsSectionProps {
  stats: Partial<AdminStats>;
}

export function EventsStatsSection({ stats }: EventsStatsSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-cormorant font-semibold mb-4 text-[#f3ebad]">Statistiques Événements</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={CalendarIcon}
          title="Total Événements"
          value={stats.events?.length || 0}
          bgClass="bg-gradient-to-br from-[#40192C] to-[#CE0067]/30"
        />
        <StatCard
          icon={CalendarDaysIcon}
          title="Événements Actifs"
          value={stats.events?.filter(e => new Date(e.event_date) > new Date()).length || 0}
        />
        <StatCard
          icon={ChartBarIcon}
          title="Événements Privés"
          value={stats.events?.filter(e => e.is_private).length || 0}
        />
      </div>
    </div>
  );
}
