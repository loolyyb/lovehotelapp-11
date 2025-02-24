import React from "react";
import { Button } from "@/components/ui/button";
import { useAdminAuthStore } from "@/stores/adminAuthStore";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventsManager } from "./events/EventsManager";
import { ThemeTab } from "./dashboard/ThemeTab";
import { VersionManager } from "./versions/VersionManager";
import { LogsManager } from "./LogsManager";
import { AdvertisementManager } from "./AdvertisementManager";
import { useAuthSession } from "@/hooks/useAuthSession";
import { UsersManager } from "./users/UsersManager";

export function AdminDashboard() {
  const setAdminAuthenticated = useAdminAuthStore(state => state.setAdminAuthenticated);
  const { toast } = useToast();
  const { session } = useAuthSession();
  
  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, auth.users(email)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const {
    data: messages
  } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('messages').select(`
          *,
          conversation:conversations(
            user1:profiles!conversations_user1_profile_fkey(user_id),
            user2:profiles!conversations_user2_profile_fkey(user_id)
          )
        `).order('created_at', {
        ascending: false
      }).limit(100);
      if (error) throw error;
      return data;
    }
  });
  const {
    data: eventsStats
  } = useQuery({
    queryKey: ['admin-events-stats'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('events').select('*');
      if (error) throw error;
      return data;
    }
  });
  const {
    data: conversationsStats
  } = useQuery({
    queryKey: ['admin-conversations-stats'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('conversations').select('*');
      if (error) throw error;
      return data;
    }
  });
  const {
    data: profilesStats
  } = useQuery({
    queryKey: ['admin-profiles-stats'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return data;
    }
  });
  const handleLogout = () => {
    setAdminAuthenticated(false);
    toast({
      title: "Déconnexion réussie",
      description: "Vous êtes déconnecté de l'interface administrateur"
    });
  };

  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredUsers = users?.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Dashboard Administrateur</h1>
        <Button variant="outline" onClick={handleLogout}>
          Déconnexion Admin
        </Button>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="bg-pink-800 hover:bg-pink-700">
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="events">Événements</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="theme">Thème</TabsTrigger>
          <TabsTrigger value="ads">Publicités</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="p-6">
            <UsersManager users={filteredUsers} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>De</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages?.map(message => <TableRow key={message.id}>
                    <TableCell>{message.id}</TableCell>
                    <TableCell>{message.sender_id}</TableCell>
                    <TableCell>{message.content}</TableCell>
                    <TableCell>{new Date(message.created_at).toLocaleString()}</TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <EventsManager />
        </TabsContent>

        <TabsContent value="versions">
          <VersionManager />
        </TabsContent>

        <TabsContent value="theme">
          <ThemeTab />
        </TabsContent>

        <TabsContent value="ads">
          <AdvertisementManager session={session} />
        </TabsContent>

        <TabsContent value="logs">
          <LogsManager />
        </TabsContent>

        <TabsContent value="stats">
          <Card className="p-6">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Statistiques Utilisateurs</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-pink-900 hover:bg-pink-800">
                    <h3 className="font-semibold mb-2">Total Utilisateurs</h3>
                    <p className="text-2xl">{users?.length || 0}</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-card">
                    <h3 className="font-semibold mb-2">Membres Premium</h3>
                    <p className="text-2xl">
                      {profilesStats?.filter(p => p.is_love_hotel_member).length || 0}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-card">
                    <h3 className="font-semibold mb-2">Nouveaux Utilisateurs (24h)</h3>
                    <p className="text-2xl">
                      {profilesStats?.filter(p => new Date(p.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length || 0}
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
                      {messages?.filter(m => new Date(m.created_at).toDateString() === new Date().toDateString()).length || 0}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-card">
                    <h3 className="font-semibold mb-2">Total Conversations</h3>
                    <p className="text-2xl">{conversationsStats?.length || 0}</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-card">
                    <h3 className="font-semibold mb-2">Messages cette semaine</h3>
                    <p className="text-2xl">
                      {messages?.filter(m => new Date(m.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Statistiques Événements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-card">
                    <h3 className="font-semibold mb-2">Total Événements</h3>
                    <p className="text-2xl">{eventsStats?.length || 0}</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-card">
                    <h3 className="font-semibold mb-2">Événements Actifs</h3>
                    <p className="text-2xl">
                      {eventsStats?.filter(e => new Date(e.event_date) > new Date()).length || 0}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-card">
                    <h3 className="font-semibold mb-2">Événements Privés</h3>
                    <p className="text-2xl">
                      {eventsStats?.filter(e => e.is_private).length || 0}
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
                      {profilesStats?.filter(p => p.avatar_url).length || 0}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-card">
                    <h3 className="font-semibold mb-2">Profils Complétés</h3>
                    <p className="text-2xl">
                      {profilesStats?.filter(p => p.bio && p.description).length || 0}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-card">
                    <h3 className="font-semibold mb-2">Profils Modérateurs</h3>
                    <p className="text-2xl">
                      {profilesStats?.filter(p => p.role === 'moderator').length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
