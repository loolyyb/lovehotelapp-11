
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdminAuthStore } from "@/stores/adminAuthStore";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase, safeQueryResult } from "@/integrations/supabase/client";
import { EventsManager } from "./events/EventsManager";
import { ThemeTab } from "./dashboard/ThemeTab";
import { VersionManager } from "./versions/VersionManager";
import { LogsManager } from "./LogsManager";
import { AdvertisementManager } from "./AdvertisementManager";
import { useAuthSession } from "@/hooks/useAuthSession";
import { UsersManager } from "./users/UsersManager";
import { StatsContent } from "./dashboard/StatsContent";
import { Input } from "../ui/input";
import { AdminUser } from "@/types/admin.types";
import { AnnouncementsManager } from "./announcements/AnnouncementsManager";
import { MessagesManager } from "./messages/MessagesManager";

export function AdminDashboard() {
  const setAdminAuthenticated = useAdminAuthStore(state => state.setAdminAuthenticated);
  const { toast } = useToast();
  const { session } = useAuthSession();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      
      return safeQueryResult<AdminUser>(profiles);
    }
  });

  const {
    data: messages
  } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, conversations!inner(user1:profiles!inner(user_id), user2:profiles!inner(user_id))');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: events } = useQuery({
    queryKey: ['admin-events-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('events').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: conversations } = useQuery({
    queryKey: ['admin-conversations-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('conversations').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: profiles } = useQuery({
    queryKey: ['admin-profiles-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
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
          <TabsTrigger value="announcements">Publications</TabsTrigger>
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
            <div className="mb-4">
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <UsersManager users={usersData} searchTerm={searchTerm} />
          </Card>
        </TabsContent>

        <TabsContent value="announcements">
          <Card className="p-6">
            <AnnouncementsManager />
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <MessagesManager />
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
          <StatsContent 
            stats={{
              users: usersData || [],
              messages,
              events,
              conversations,
              profiles
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
