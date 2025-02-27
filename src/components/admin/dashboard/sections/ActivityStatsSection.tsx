
import { AdminStats } from "@/types/admin.types";
import { ImageIcon, FileTextIcon, UserCheckIcon } from "lucide-react";
import { StatCard } from "../components/StatCard";

interface ActivityStatsSectionProps {
  stats: Partial<AdminStats>;
}

export function ActivityStatsSection({ stats }: ActivityStatsSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-cormorant font-semibold mb-4 text-[#f3ebad]">Activité Générale</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={ImageIcon}
          title="Utilisteurs avec Photo"
          value={stats.profiles?.filter(p => p.avatar_url).length || 0}
        />
        <StatCard
          icon={FileTextIcon}
          title="Profils Complétés"
          value={stats.profiles?.filter(p => p.bio && p.description).length || 0}
          trend="+8%"
        />
        <StatCard
          icon={UserCheckIcon}
          title="Profils Modérateurs"
          value={stats.profiles?.filter(p => p.role === 'moderator').length || 0}
        />
      </div>
    </div>
  );
}
