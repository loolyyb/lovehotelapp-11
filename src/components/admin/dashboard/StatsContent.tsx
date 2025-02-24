
import { Card } from "@/components/ui/card";
import { AdminStats } from "@/types/admin.types";
import { ChartBarIcon, UsersIcon, MessageSquareIcon, CalendarIcon, UserIcon, ShieldCheckIcon, ImageIcon, FileTextIcon, UserCheckIcon, TrendingUpIcon, MessageCircleIcon, CalendarDaysIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

export function StatsContent({ stats }: { stats: Partial<AdminStats> }) {
  // Préparer les données pour le graphique des messages
  const messageData = stats.messages?.map(m => ({
    date: new Date(m.created_at).toLocaleDateString(),
    count: 1
  })).reduce((acc: any[], curr) => {
    const existing = acc.find(a => a.date === curr.date);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push(curr);
    }
    return acc;
  }, []) || [];

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    trend, 
    bgClass = "bg-[#40192C]",
    chartData
  }: { 
    icon: any, 
    title: string, 
    value: number | string,
    trend?: string,
    bgClass?: string,
    chartData?: any[]
  }) => (
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
            className="h-1 mt-4 bg-[#f3ebad]/10" 
            indicatorClassName="bg-[#f3ebad]" 
          />
        )}
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-8 p-6">
      {/* Section Utilisateurs */}
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

      {/* Section Messages */}
      <div>
        <h3 className="text-lg font-cormorant font-semibold mb-4 text-[#f3ebad]">Statistiques Messages</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={MessageSquareIcon}
            title="Messages Aujourd'hui"
            value={stats.messages?.filter(m => new Date(m.created_at).toDateString() === new Date().toDateString()).length || 0}
            chartData={messageData}
            bgClass="bg-gradient-to-br from-[#40192C] to-[#CE0067]/50"
          />
          <StatCard
            icon={MessageCircleIcon}
            title="Total Conversations"
            value={stats.conversations?.length || 0}
          />
          <StatCard
            icon={TrendingUpIcon}
            title="Messages cette semaine"
            value={stats.messages?.filter(m => new Date(m.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0}
            trend="+23%"
          />
        </div>
      </div>

      {/* Section Événements */}
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

      {/* Section Activité */}
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
    </div>
  );
}
