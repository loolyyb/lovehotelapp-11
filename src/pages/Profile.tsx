import React from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { ProfileTabs } from "@/components/profile/tabs/ProfileTabs";

export default function Profile() {
  const { userProfile, loading } = useAuthSession();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100 flex items-center justify-center">
        <div className="animate-pulse text-burgundy">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100">
      <div className="container mx-auto px-4 py-4">
        <ProfileTabs profile={userProfile} onUpdate={() => {}} />
      </div>
    </div>
  );
}