import { ProfilePreferencesQuestions } from "../ProfilePreferencesQuestions";
import { WidgetContainer } from "./WidgetContainer";

interface PreferencesSectionProps {
  preferences: any;
  onPreferenceChange: (updates: any) => void;
}

export function PreferencesSection({ preferences, onPreferenceChange }: PreferencesSectionProps) {
  return (
    <WidgetContainer title="Préférences">
      <ProfilePreferencesQuestions
        openCurtainsInterest={preferences?.open_curtains_interest}
        speedDatingInterest={preferences?.speed_dating_interest}
        libertinePartyInterest={preferences?.libertine_party_interest}
        onPreferenceChange={onPreferenceChange}
      />
    </WidgetContainer>
  );
}