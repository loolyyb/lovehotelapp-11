
import { ProfileSeeking } from "../ProfileSeeking";
import { WidgetContainer } from "./WidgetContainer";

interface SeekingSectionProps {
  seeking: string[] | null;
  status: string | null;
  orientation: string | null;
  onUpdate: (value: any) => void;
}

export function SeekingSection({ seeking, status, orientation, onUpdate }: SeekingSectionProps) {
  return (
    <WidgetContainer title="Je recherche">
      <div className="text-[#f3ebad]">
        <ProfileSeeking
          seeking={seeking}
          status={status}
          orientation={orientation}
          onSeekingChange={(seeking) => onUpdate({ seeking })}
        />
      </div>
    </WidgetContainer>
  );
}
