
import { TabsContent } from "@/components/ui/tabs";
import { AdvertisementManager } from "../AdvertisementManager";
import { LogsManager } from "../LogsManager";
import { VersionManager } from "../versions/VersionManager";
import { ThemeTab } from "./ThemeTab";
import { UsersTab } from "./UsersTab";
import { ConversationsTab } from "./ConversationsTab";
import { EventsManager } from "../events/EventsManager";
import { PushNotificationsManager } from "../notifications/PushNotificationsManager";
import { Session } from "@supabase/supabase-js";

interface AdminTabsContentProps {
  session: Session;
}

export function AdminTabsContent({ session }: AdminTabsContentProps) {
  return (
    <>
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

      <TabsContent value="events">
        <EventsManager />
      </TabsContent>

      <TabsContent value="ads">
        <AdvertisementManager session={session} />
      </TabsContent>

      <TabsContent value="logs">
        <LogsManager />
      </TabsContent>

      <TabsContent value="notifications">
        <PushNotificationsManager session={session} />
      </TabsContent>
    </>
  );
}
