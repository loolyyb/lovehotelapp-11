import React from "react";
import { Card } from "@/components/ui/card";
import { RegistrationFlow } from "@/components/registration/RegistrationFlow";

export default function Registration() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100 py-8 px-4">
      <Card className="max-w-4xl mx-auto p-6 bg-white/80 backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-burgundy mb-6">
          Complétez votre profil
        </h1>
        <RegistrationFlow />
      </Card>
    </div>
  );
}