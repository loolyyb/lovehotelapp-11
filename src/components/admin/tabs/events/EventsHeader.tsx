import React from "react";
import { Search } from "lucide-react";
import { CreateEventDialog } from "./CreateEventDialog";

interface EventsHeaderProps {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  onCreateEvent: (values: any) => Promise<void>;
  isCreating: boolean;
}

export function EventsHeader({
  isCreateModalOpen,
  setIsCreateModalOpen,
  onCreateEvent,
  isCreating
}: EventsHeaderProps) {
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des événements</h2>
        <CreateEventDialog
          isOpen={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSubmit={onCreateEvent}
          isLoading={isCreating}
        />
      </div>

      <div className="admin-search flex items-center gap-3 mb-8">
        <Search className="text-admin-muted" size={20} />
        <input 
          type="text" 
          placeholder="Rechercher..." 
          className="admin-input w-full"
        />
      </div>
    </>
  );
}