import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuthStore } from "@/stores/adminAuthStore";

interface AdminPasswordCheckProps {
  onPasswordValid: () => void;
}

export function AdminPasswordCheck({ onPasswordValid }: AdminPasswordCheckProps) {
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const setAdminAuthenticated = useAdminAuthStore((state) => state.setAdminAuthenticated);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Reussite888!") {
      setAdminAuthenticated(true);
      onPasswordValid();
    } else {
      toast({
        title: "Erreur",
        description: "Mot de passe incorrect",
        variant: "destructive",
      });
    }
  };

  return (
    <div id="admin-panel" className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">Accès Administrateur</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe administrateur"
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full">
            Connexion
          </Button>
        </form>
      </Card>
    </div>
  );
}