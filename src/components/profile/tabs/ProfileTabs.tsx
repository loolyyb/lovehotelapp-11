import { CreditCard, Calendar, Heart, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { AccountTab } from "./AccountTab";
import { FidelityTab } from "./FidelityTab";
import { ReservationsTab } from "./ReservationsTab";
import { DatingTab } from "./DatingTab";
import { ActivitiesTab } from "./ActivitiesTab";

interface ProfileTabsProps {
  profile: any;
  onUpdate: (updates: any) => Promise<void>;
}

export function ProfileTabs({ profile, onUpdate }: ProfileTabsProps) {
  const isMobile = useIsMobile();

  const tabs = [
    { id: "account", label: "Mon Compte", icon: CreditCard },
    { id: "fidelity", label: "Fidélité", icon: Heart },
    { id: "reservations", label: "Mes Réservations", icon: Calendar },
    { id: "dating", label: "Rencontres", icon: Heart },
    { id: "activities", label: "Mes Activités", icon: Activity },
  ];

  if (isMobile) {
    return (
      <Tabs defaultValue="account" className="w-full">
        <div className="mb-6">
          <Select defaultValue="account">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez une section" />
            </SelectTrigger>
            <SelectContent>
              {tabs.map((tab) => (
                <SelectItem key={tab.id} value={tab.id}>
                  <div className="flex items-center gap-2">
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="account">
          <AccountTab profile={profile} onUpdate={onUpdate} />
        </TabsContent>

        <TabsContent value="fidelity">
          <FidelityTab profile={profile} onUpdate={onUpdate} />
        </TabsContent>

        <TabsContent value="reservations">
          <ReservationsTab />
        </TabsContent>

        <TabsContent value="dating">
          <DatingTab profile={profile} onUpdate={onUpdate} />
        </TabsContent>

        <TabsContent value="activities">
          <ActivitiesTab />
        </TabsContent>
      </Tabs>
    );
  }

  return (
    <Tabs defaultValue="account" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="account">
        <AccountTab profile={profile} onUpdate={onUpdate} />
      </TabsContent>

      <TabsContent value="fidelity">
        <FidelityTab profile={profile} onUpdate={onUpdate} />
      </TabsContent>

      <TabsContent value="reservations">
        <ReservationsTab />
      </TabsContent>

      <TabsContent value="dating">
        <DatingTab profile={profile} onUpdate={onUpdate} />
      </TabsContent>

      <TabsContent value="activities">
        <ActivitiesTab />
      </TabsContent>
    </Tabs>
  );
}