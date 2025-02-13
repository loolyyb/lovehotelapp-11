
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdvertisementManager } from "./AdvertisementManager";
import { LogsManager } from "./LogsManager";
import { VersionManager } from "./versions/VersionManager";
import { ThemeTab } from "./dashboard/ThemeTab";
import { UsersTab } from "./dashboard/UsersTab";
import { ConversationsTab } from "./dashboard/ConversationsTab";
import { Session } from "@supabase/supabase-js";

interface AdminDashboardContentProps {
  session: Session;
}

export function AdminDashboardContent({ session }: AdminDashboardContentProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-8">Tableau de bord administrateur</h1>
      
      <Tabs defaultValue="theme" className="space-y-6">
        <TabsList>
          <TabsTrigger value="theme">Thème</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="ads">Publicités</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="theme">
          <ThemeTab />
        </TabsContent>

        <TabsContent value="users">
          <UsersTab />
        </TabsContent>

        <TabsContent value="conversations">
          <ConversationsTab />
        </TabsContent>

        <TabsContent value="versions">
          <VersionManager />
        </TabsContent>

        <TabsContent value="ads">
          <AdvertisementManager session={session} />
        </TabsContent>

        <TabsContent value="logs">
          <LogsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
