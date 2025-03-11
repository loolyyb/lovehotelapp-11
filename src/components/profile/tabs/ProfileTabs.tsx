
import { CreditCard, Heart, CalendarCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { AccountTab } from "./AccountTab";
import { FidelityTab } from "./FidelityTab";
import { ReservationsTab } from "./ReservationsTab";
import { DatingTab } from "./DatingTab";
import { useState } from "react";

interface ProfileTabsProps {
  profile: any;
  onUpdate: (updates: any) => Promise<void>;
  isSaving?: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
}

export function ProfileTabs({ profile, onUpdate, isSaving = false, setHasUnsavedChanges }: ProfileTabsProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("account");

  const tabs = [
    { id: "account", label: "Mon Compte", icon: CreditCard },
    { id: "fidelity", label: "Fidélité", icon: Heart },
    { id: "dating", label: "Rencontres", icon: Heart },
    { id: "reservations", label: "Mes Réservations", icon: CalendarCheck },
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (isMobile) {
    return (
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="mb-6">
          <Select value={activeTab} onValueChange={handleTabChange}>
            <SelectTrigger className="w-full bg-[#40192C] border-[0.5px] border-[#f3ebad]/30 backdrop-blur-sm text-[#f3ebad]">
              <SelectValue placeholder="Sélectionnez une section">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[#40192C] border-[0.5px] border-[#f3ebad]/30 text-[#f3ebad]">
              {tabs.map((tab) => (
                <SelectItem key={tab.id} value={tab.id} className="text-[#f3ebad] focus:bg-[#f3ebad]/10 focus:text-white">
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
          <AccountTab profile={profile} onUpdate={onUpdate} setHasUnsavedChanges={setHasUnsavedChanges} />
        </TabsContent>

        <TabsContent value="fidelity">
          <FidelityTab profile={profile} onUpdate={onUpdate} />
        </TabsContent>

        <TabsContent value="dating">
          <DatingTab profile={profile} onUpdate={onUpdate} />
        </TabsContent>

        <TabsContent value="reservations">
          <ReservationsTab />
        </TabsContent>
      </Tabs>
    );
  }

  return (
    <Tabs defaultValue="account" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-[#40192C]/70">
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.id} 
            value={tab.id} 
            className="flex items-center gap-2 bg-[#40192C] border-[0.5px] border-[#f3ebad]/30 backdrop-blur-sm text-[#f3ebad] data-[state=active]:text-white data-[state=active]:bg-[#ce0067]"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="account">
        <AccountTab profile={profile} onUpdate={onUpdate} setHasUnsavedChanges={setHasUnsavedChanges} />
      </TabsContent>

      <TabsContent value="fidelity">
        <FidelityTab profile={profile} onUpdate={onUpdate} />
      </TabsContent>

      <TabsContent value="dating">
        <DatingTab profile={profile} onUpdate={onUpdate} />
      </TabsContent>

      <TabsContent value="reservations">
        <ReservationsTab />
      </TabsContent>
    </Tabs>
  );
}
