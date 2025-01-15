import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page non trouvée</p>
      <Button onClick={() => navigate("/")}>
        Retour à l'accueil
      </Button>
    </div>
  );
}