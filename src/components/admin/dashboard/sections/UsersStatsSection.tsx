
import { AdminStats } from "@/types/admin.types";
import { UsersIcon, ShieldCheckIcon, UserIcon } from "lucide-react";
import { StatCard } from "../components/StatCard";

interface UserStatsSectionProps {
  stats: Partial<AdminStats>;
}

export function UsersStatsSection({ stats }: UserStatsSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-cormorant font-semibold mb-4 text-[#f3ebad]">Statistiques Utilisateurs</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={UsersIcon}
          title="Total Utilisateurs"
          value={stats.users?.length || 0}
          trend="+12% ce mois"
          bgClass="bg-gradient-to-br from-[#CE0067] to-[#40192C]"
        />
        <StatCard
          icon={ShieldCheckIcon}
          title="Membres Premium"
          value={stats.profiles?.filter(p => p.is_love_hotel_member).length || 0}
          trend="+5% cette semaine"
        />
        <StatCard
          icon={UserIcon}
          title="Nouveaux Utilisateurs (24h)"
          value={stats.profiles?.filter(p => new Date(p.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length || 0}
        />
      </div>
    </div>
  );
}
