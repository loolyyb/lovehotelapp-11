import React from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function StatsTab() {
  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: messages } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Total Utilisateurs</h3>
          <p className="text-2xl">{users?.length || 0}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Messages Aujourd'hui</h3>
          <p className="text-2xl">
            {messages?.filter(m => 
              new Date(m.created_at).toDateString() === new Date().toDateString()
            ).length || 0}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Utilisateurs Actifs</h3>
          <p className="text-2xl">
            {users?.length || 0}
          </p>
        </div>
      </div>
    </Card>
  );
}