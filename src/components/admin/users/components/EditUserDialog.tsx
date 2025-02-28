
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditUserDialogProps } from "../types";
import { useUserManagement } from "../hooks/useUserManagement";

export function EditUserDialog({ user, isOpen, onOpenChange, onSubmit }: EditUserDialogProps) {
  const { setUserAsAdmin } = useUserManagement();

  // Pour définir l'utilisateur spécifique comme admin lors du chargement initial
  useEffect(() => {
    // Cette fonction sera exécutée une seule fois
    const setAdminUser = async () => {
      try {
        await setUserAsAdmin();
        console.log("L'utilisateur b777ae12-9da5-46c7-9506-741e90e7d9a8 a été défini comme administrateur");
      } catch (error) {
        console.error("Erreur lors de la définition de l'administrateur:", error);
      }
    };
    
    setAdminUser();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      full_name: formData.get("full_name") as string,
      role: formData.get("role") as "user" | "moderator" | "admin",
      account_status: formData.get("account_status") as string,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="full_name">Nom complet</label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={user?.full_name || ""}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="role">Rôle</label>
            <select
              id="role"
              name="role"
              className="w-full p-2 border rounded"
              defaultValue={user?.role}
            >
              <option value="user">Utilisateur</option>
              <option value="moderator">Modérateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="account_status">Statut du compte</label>
            <select
              id="account_status"
              name="account_status"
              className="w-full p-2 border rounded"
              defaultValue={user?.account_status}
            >
              <option value="active">Actif</option>
              <option value="disabled">Désactivé</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
