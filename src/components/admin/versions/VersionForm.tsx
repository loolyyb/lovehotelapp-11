
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

interface VersionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

type VersionFormData = {
  version: string;
  version_type: Database["public"]["Enums"]["app_version_type"];
  release_notes: string;
  is_critical: boolean;
  is_active: boolean;
};

export function VersionForm({ onSuccess, onCancel }: VersionFormProps) {
  const { toast } = useToast();
  const { register, handleSubmit, watch, setValue } = useForm<VersionFormData>({
    defaultValues: {
      version: "",
      version_type: "patch",
      release_notes: "",
      is_critical: false,
      is_active: true,
    },
  });

  const onSubmit = async (data: VersionFormData) => {
    try {
      const { error } = await supabase.from("app_versions").insert([data]);

      if (error) throw error;

      toast({
        title: "Version créée",
        description: "La nouvelle version a été ajoutée avec succès.",
      });
      onSuccess();
    } catch (error) {
      console.error("Error creating version:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la version.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="version">Numéro de version</Label>
            <Input
              id="version"
              placeholder="1.0.0"
              {...register("version", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="version_type">Type de version</Label>
            <Select
              onValueChange={(value: Database["public"]["Enums"]["app_version_type"]) =>
                setValue("version_type", value)
              }
              defaultValue={watch("version_type")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="major">Majeure</SelectItem>
                <SelectItem value="minor">Mineure</SelectItem>
                <SelectItem value="patch">Patch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="release_notes">Notes de version</Label>
          <Textarea
            id="release_notes"
            placeholder="Décrivez les changements..."
            {...register("release_notes")}
          />
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_critical"
              checked={watch("is_critical")}
              onCheckedChange={(checked) => setValue("is_critical", checked)}
            />
            <Label htmlFor="is_critical">Version critique</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={watch("is_active")}
              onCheckedChange={(checked) => setValue("is_active", checked)}
            />
            <Label htmlFor="is_active">Version active</Label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">Créer la version</Button>
        </div>
      </form>
    </Card>
  );
}
