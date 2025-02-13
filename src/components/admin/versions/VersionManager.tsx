
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Loader2 } from "lucide-react";
import { VersionForm } from "./VersionForm";
import { useState } from "react";

export function VersionManager() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const { data: versions, isLoading, refetch } = useQuery({
    queryKey: ["app-versions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_versions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Tables<"app_versions">[];
    },
  });

  const handleStatusChange = async (versionId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("app_versions")
        .update({ is_active: isActive })
        .eq("id", versionId);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `La version a été ${isActive ? "activée" : "désactivée"} avec succès.`,
      });
      refetch();
    } catch (error) {
      console.error("Error updating version status:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la version.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Gestion des versions</h2>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Nouvelle version
        </Button>
      </div>

      {showForm && (
        <div className="mb-6">
          <VersionForm
            onSuccess={() => {
              setShowForm(false);
              refetch();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="space-y-4">
        {versions?.map((version) => (
          <div
            key={version.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Version {version.version}</h3>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    version.version_type === "major"
                      ? "bg-red-100 text-red-800"
                      : version.version_type === "minor"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {version.version_type}
                </span>
                {version.is_critical && (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                    Critique
                  </span>
                )}
              </div>
              {version.release_notes && (
                <p className="text-sm text-gray-600">{version.release_notes}</p>
              )}
              <div className="text-xs text-gray-500">
                Publiée le {new Date(version.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant={version.is_active ? "destructive" : "default"}
                onClick={() => handleStatusChange(version.id, !version.is_active)}
                className="text-sm"
              >
                {version.is_active ? "Désactiver" : "Activer"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
