import React from "react";
import { Button } from "@/components/ui/button";
import { useAdminAuthStore } from "@/stores/adminAuthStore";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTab } from "./tabs/UsersTab";
import { ConversationsTab } from "./tabs/ConversationsTab";
import { StatsTab } from "./tabs/StatsTab";
import { AdvertisementManager } from "./AdvertisementManager";
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
    <div id="admin-panel" className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
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
        <div className="search-bar flex items-center gap-3 mb-8">
          <Search className="text-admin-muted" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="bg-transparent border-none w-full focus:outline-none"
          />
          <Menu className="text-admin-muted cursor-pointer hover:text-admin-text" size={20} />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="stats" className="space-y-8">
          <TabsList className="bg-admin-card/50 p-1 rounded-lg border border-admin-border">
            <TabsTrigger 
              value="stats"
              className="transition-colors duration-300 data-[state=active]:bg-admin-primary data-[state=active]:text-white"
            >
              Statistiques
            </TabsTrigger>
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
              value="ads"
              className="transition-colors duration-300 data-[state=active]:bg-admin-primary data-[state=active]:text-white"
            >
              Publicités
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="animate-fadeIn">
            <StatsTab />
          </TabsContent>

          <TabsContent value="users" className="animate-fadeIn">
            <UsersTab />
          </TabsContent>

          <TabsContent value="messages" className="animate-fadeIn">
            <ConversationsTab />
          </TabsContent>

          <TabsContent value="ads" className="animate-fadeIn">
            <AdvertisementManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}