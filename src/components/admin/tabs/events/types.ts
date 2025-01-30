import { Event } from "@/types/events";

export interface EventTableProps {
  events: Event[] | undefined;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
  onShowParticipants: (event: Event) => void;
  isUpdateLoading: boolean;
}

export interface EventFormModalProps {
  event?: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  isLoading: boolean;
}

export interface EventActionsProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
  onShowParticipants: (event: Event) => void;
  isUpdateLoading: boolean;
}