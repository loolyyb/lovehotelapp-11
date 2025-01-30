import { Event as BaseEvent } from "@/types/events";

export interface EventTableProps {
  events: BaseEvent[] | undefined;
  onEdit: (event: BaseEvent) => void;
  onDelete: (eventId: string) => void;
  onShowParticipants: (event: BaseEvent) => void;
  isUpdateLoading: boolean;
}

export interface EventFormModalProps {
  event?: BaseEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  isLoading: boolean;
}

export interface EventActionsProps {
  event: BaseEvent;
  onEdit: (event: BaseEvent) => void;
  onDelete: (eventId: string) => void;
  onShowParticipants: (event: BaseEvent) => void;
  isUpdateLoading: boolean;
}