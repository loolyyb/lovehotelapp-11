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
    <div id="admin-panel" className="min-h-screen bg-admin-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-admin-text">Dashboard Administrateur</h1>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="transition-all duration-300 hover:scale-105 bg-admin-primary text-white hover:bg-admin-secondary"
          >
            Déconnexion Admin
          </Button>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-admin-card rounded-lg p-1">
            <TabsTrigger 
              value="users"
              className="transition-colors duration-300 data-[state=active]:bg-admin-primary data-[state=active]:text-white"
            >
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger 
              value="messages"
              className="transition-colors duration-300 data-[state=active]:bg-admin-primary data-[state=active]:text-white"
            >
              Messages
            </TabsTrigger>
            <TabsTrigger 
              value="stats"
              className="transition-colors duration-300 data-[state=active]:bg-admin-primary data-[state=active]:text-white"
            >
              Statistiques
            </TabsTrigger>
            <TabsTrigger 
              value="ads"
              className="transition-colors duration-300 data-[state=active]:bg-admin-primary data-[state=active]:text-white"
            >
              Publicités
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="animate-fadeIn">
            <UsersTab />
          </TabsContent>

          <TabsContent value="messages" className="animate-fadeIn">
            <ConversationsTab />
          </TabsContent>

          <TabsContent value="stats" className="animate-fadeIn">
            <StatsTab />
          </TabsContent>

          <TabsContent value="ads" className="animate-fadeIn">
            <AdvertisementManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}