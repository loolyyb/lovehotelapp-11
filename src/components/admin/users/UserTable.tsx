
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Ban } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserUpdateForm } from "./UserUpdateForm";

interface UserTableProps {
  users: any[];
  onUpdate: (userId: string, updates: any) => void;
  onDelete: (userId: string) => void;
}

export function UserTable({ users, onUpdate, onDelete }: UserTableProps) {
  const [selectedUser, setSelectedUser] = React.useState<any>(null);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Date d'inscription</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.full_name}</TableCell>
              <TableCell>{user.user?.email}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.account_status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.account_status || 'actif'}
                </span>
              </TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                {new Date(user.created_at).toLocaleDateString('fr-FR')}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Modifier l'utilisateur</DialogTitle>
                    </DialogHeader>
                    <UserUpdateForm
                      user={selectedUser}
                      onSubmit={(updates) => {
                        onUpdate(selectedUser.id, updates);
                        setSelectedUser(null);
                      }}
                    />
                  </DialogContent>
                </Dialog>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onUpdate(user.id, {
                    account_status: user.account_status === 'active' ? 'disabled' : 'active'
                  })}
                >
                  <Ban className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(user.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
