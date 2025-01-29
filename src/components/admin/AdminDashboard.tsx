import React from "react";
import { Button } from "@/components/ui/button";
import { useAdminAuthStore } from "@/stores/adminAuthStore";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTab } from "./tabs/UsersTab";
import { ConversationsTab } from "./tabs/ConversationsTab";
import { StatsTab } from "./tabs/StatsTab";
import { RequestsTab } from "./tabs/RequestsTab";
import { AdvertisementManager } from "./AdvertisementManager";
import { NotificationsTab } from "./tabs/NotificationsTab";
import { EventsTab } from "./tabs/EventsTab";
import { Search, Menu } from "lucide-react";

export function AdminDashboard() {
  const setAdminAuthenticated = useAdminAuthStore((state) => state.setAdminAuthenticated);
  const { toast } = useToast();

  const handleLogout = () => {
    setAdminAuthenticated(false);
    toast({
      title: "Déconnexion réussie",
      description: "Vous êtes déconnecté de l'interface administrateur",
    });
  };

  return (
    <div className="admin-panel">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="admin-header">
          <div>
            <h1 className="text-2xl font-bold mb-2">Bienvenue, Admin</h1>
            <p className="text-admin-muted">Gérez et suivez les activités de votre plateforme</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="admin-button"
          >
            Déconnexion
          </Button>
        </div>

        {/* Search Bar */}
        <div className="admin-search flex items-center gap-3 mb-8">
          <Search className="text-admin-muted" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="admin-input w-full"
          />
          <Menu className="text-admin-muted cursor-pointer hover:text-admin-text" size={20} />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="stats" className="admin-tabs">
          <TabsList className="bg-admin-card/50 p-1 rounded-lg border border-admin-border">
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="requests">Demandes</TabsTrigger>
            <TabsTrigger value="events">Événements</TabsTrigger>
            <TabsTrigger value="ads">Publicités</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <StatsTab />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>

          <TabsContent value="messages">
            <ConversationsTab />
          </TabsContent>

          <TabsContent value="requests">
            <RequestsTab />
          </TabsContent>

          <TabsContent value="events">
            <EventsTab />
          </TabsContent>

          <TabsContent value="ads">
            <AdvertisementManager />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}