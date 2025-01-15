import React from "react";
import { AdminPasswordCheck } from "./AdminPasswordCheck";
import { AdminDashboardContent } from "./AdminDashboardContent";

export function AdminDashboard() {
  const [isPasswordValid, setIsPasswordValid] = React.useState(false);

  if (!isPasswordValid) {
    return <AdminPasswordCheck onPasswordValid={() => setIsPasswordValid(true)} />;
  }

  return <AdminDashboardContent />;
}