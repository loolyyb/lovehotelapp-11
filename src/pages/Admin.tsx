import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

const ADMIN_PASSWORD = "$Reussite888!";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: "Authentification réussie",
        description: "Bienvenue dans l'interface d'administration",
      });
    } else {
      toast({
        title: "Erreur d'authentification",
        description: "Mot de passe incorrect",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-50 to-pink-50">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-2xl font-semibold mb-6 text-center">Administration</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full">
              Accéder
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return <AdminDashboard />;
}