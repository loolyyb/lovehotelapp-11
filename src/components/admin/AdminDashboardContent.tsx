
import React from "react";
import { Tabs } from "@/components/ui/tabs";
import { AdminTabsList } from "./dashboard/AdminTabsList";
import { AdminTabsContent } from "./dashboard/AdminTabsContent";
import { Session } from "@supabase/supabase-js";

interface AdminDashboardContentProps {
  session: Session;
}

export function AdminDashboardContent({ session }: AdminDashboardContentProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-8">Tableau de bord administrateur</h1>
      
      <Tabs defaultValue="theme" className="space-y-6">
        <AdminTabsList />
        <AdminTabsContent session={session} />
      </Tabs>
    </div>
  );
}
