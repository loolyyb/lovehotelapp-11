import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdvertisementManager } from "./AdvertisementManager";
import { LogsManager } from "./LogsManager";

export function AdminDashboardContent() {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="advertisements" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="advertisements">Publicités</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="advertisements">
          <AdvertisementManager />
        </TabsContent>
        <TabsContent value="logs">
          <LogsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}