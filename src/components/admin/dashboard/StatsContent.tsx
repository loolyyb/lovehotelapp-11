
import { Card } from "@/components/ui/card";
import { AdminStats } from "@/types/admin.types";

export function StatsContent({ stats }: { stats: Partial<AdminStats> }) {
  return (
    <Card className="p-6">
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Statistiques Utilisateurs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-pink-900 hover:bg-pink-800">
              <h3 className="font-semibold mb-2">Total Utilisateurs</h3>
              <p className="text-2xl">{stats.users?.length || 0}</p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Membres Premium</h3>
              <p className="text-2xl">
                {stats.profiles?.filter(p => p.is_love_hotel_member).length || 0}
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Nouveaux Utilisateurs (24h)</h3>
              <p className="text-2xl">
                {stats.profiles?.filter(p => new Date(p.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Statistiques Messages</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Messages Aujourd'hui</h3>
              <p className="text-2xl">
                {stats.messages?.filter(m => new Date(m.created_at).toDateString() === new Date().toDateString()).length || 0}
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Total Conversations</h3>
              <p className="text-2xl">{stats.conversations?.length || 0}</p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Messages cette semaine</h3>
              <p className="text-2xl">
                {stats.messages?.filter(m => new Date(m.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Statistiques Événements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Total Événements</h3>
              <p className="text-2xl">{stats.events?.length || 0}</p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Événements Actifs</h3>
              <p className="text-2xl">
                {stats.events?.filter(e => new Date(e.event_date) > new Date()).length || 0}
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Événements Privés</h3>
              <p className="text-2xl">
                {stats.events?.filter(e => e.is_private).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Activité Générale</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Utilisteurs avec Photo</h3>
              <p className="text-2xl">
                {stats.profiles?.filter(p => p.avatar_url).length || 0}
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Profils Complétés</h3>
              <p className="text-2xl">
                {stats.profiles?.filter(p => p.bio && p.description).length || 0}
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Profils Modérateurs</h3>
              <p className="text-2xl">
                {stats.profiles?.filter(p => p.role === 'moderator').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
