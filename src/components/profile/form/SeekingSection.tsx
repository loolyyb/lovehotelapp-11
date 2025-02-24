
import { ProfileSeeking } from "../ProfileSeeking";
import { WidgetContainer } from "./WidgetContainer";

interface SeekingSectionProps {
  seeking: string[] | null;
  status: string | null;
  orientation: string | null;
  onUpdate: (value: any) => void;  // Changed from Promise<void> to void
}

export function SeekingSection({ seeking, status, orientation, onUpdate }: SeekingSectionProps) {
  return (
    <WidgetContainer title="Je recherche">
      <ProfileSeeking
        seeking={seeking}
        status={status}
        orientation={orientation}
        onSeekingChange={(seeking) => onUpdate({ seeking })}
      />
    </WidgetContainer>
  );
}
