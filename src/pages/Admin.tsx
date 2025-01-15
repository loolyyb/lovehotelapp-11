import React, { useState } from "react";
import { AdminPasswordCheck } from "@/components/admin/AdminPasswordCheck";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AdminPasswordCheck onPasswordValid={() => setIsAuthenticated(true)} />;
  }

  return <AdminDashboard />;
}