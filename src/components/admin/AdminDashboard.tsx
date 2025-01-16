/**
 * AdminDashboard Component
 * 
 * Main dashboard interface for administrators to manage users, view conversations,
 * and monitor site statistics. Provides a tabbed interface for easy navigation
 * between different administrative functions.
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { useAdminAuthStore } from "@/stores/adminAuthStore";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTab } from "./tabs/UsersTab";
import { ConversationsTab } from "./tabs/ConversationsTab";
import { StatsTab } from "./tabs/StatsTab";
import { AdvertisementManager } from "./AdvertisementManager";

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
    <div id="admin-panel" className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="admin-header">
          <h1 className="text-2xl font-semibold">Dashboard Administrateur</h1>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="admin-button"
          >
            Déconnexion Admin
          </Button>
        </div>

        <Tabs defaultValue="users" className="admin-tabs">
          <TabsList className="bg-admin-card">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="ads">Publicités</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>

          <TabsContent value="messages">
            <ConversationsTab />
          </TabsContent>

          <TabsContent value="stats">
            <StatsTab />
          </TabsContent>

          <TabsContent value="ads">
            <AdvertisementManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}