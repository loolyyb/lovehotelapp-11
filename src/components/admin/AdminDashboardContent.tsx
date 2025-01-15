import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdvertisementManager } from "./AdvertisementManager";
import { UsersManager } from "./UsersManager";
import { EventsManager } from "./EventsManager";
import { LogsManager } from "./LogsManager";

export function AdminDashboardContent() {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="events">Évènements</TabsTrigger>
          <TabsTrigger value="advertisements">Publicités</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="tab5" disabled>À venir</TabsTrigger>
          <TabsTrigger value="tab6" disabled>À venir</TabsTrigger>
          <TabsTrigger value="tab7" disabled>À venir</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UsersManager />
        </TabsContent>
        <TabsContent value="events">
          <EventsManager />
        </TabsContent>
        <TabsContent value="advertisements">
          <AdvertisementManager />
        </TabsContent>
        <TabsContent value="logs">
          <LogsManager />
        </TabsContent>
        <TabsContent value="tab5">
          <div className="text-center p-4 text-muted-foreground">
            Fonctionnalité à venir
          </div>
        </TabsContent>
        <TabsContent value="tab6">
          <div className="text-center p-4 text-muted-foreground">
            Fonctionnalité à venir
          </div>
        </TabsContent>
        <TabsContent value="tab7">
          <div className="text-center p-4 text-muted-foreground">
            Fonctionnalité à venir
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}