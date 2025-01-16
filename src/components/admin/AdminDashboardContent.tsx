import React from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { Session } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdvertisementManager } from "./AdvertisementManager";
import { LogsManager } from "./LogsManager";
import { ThemeTab } from "./tabs/ThemeTab";
import { UsersTab } from "./tabs/UsersTab";
import { ConversationsTab } from "./tabs/ConversationsTab";

interface AdminDashboardContentProps {
  session: Session;
}

export function AdminDashboardContent({ session }: AdminDashboardContentProps) {
  const { currentThemeName, switchTheme } = useTheme();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-8">Tableau de bord administrateur</h1>
      
      <Tabs defaultValue="theme" className="space-y-6">
        <TabsList>
          <TabsTrigger value="theme">Thème</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="ads">Publicités</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="theme">
          <ThemeTab 
            currentThemeName={currentThemeName}
            switchTheme={switchTheme}
          />
        </TabsContent>

        <TabsContent value="users">
          <UsersTab />
        </TabsContent>

        <TabsContent value="conversations">
          <ConversationsTab />
        </TabsContent>

        <TabsContent value="ads">
          <AdvertisementManager />
        </TabsContent>

        <TabsContent value="logs">
          <LogsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}