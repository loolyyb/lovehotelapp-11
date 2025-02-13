
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminTabsList() {
  return (
    <TabsList>
      <TabsTrigger value="theme">Thème</TabsTrigger>
      <TabsTrigger value="users">Utilisateurs</TabsTrigger>
      <TabsTrigger value="conversations">Conversations</TabsTrigger>
      <TabsTrigger value="versions">Versions</TabsTrigger>
      <TabsTrigger value="events">Événements</TabsTrigger>
      <TabsTrigger value="ads">Publicités</TabsTrigger>
      <TabsTrigger value="logs">Logs</TabsTrigger>
      <TabsTrigger value="notifications">Notifications Push</TabsTrigger>
    </TabsList>
  );
}
