import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ProfilePreferencesQuestionsProps {
  openCurtainsInterest?: boolean;
  speedDatingInterest?: boolean;
  libertinePartyInterest?: boolean;
  onPreferenceChange: (updates: {
    openCurtainsInterest?: boolean;
    speedDatingInterest?: boolean;
    libertinePartyInterest?: boolean;
  }) => void;
}

export function ProfilePreferencesQuestions({
  openCurtainsInterest = false,
  speedDatingInterest = false,
  libertinePartyInterest = false,
  onPreferenceChange,
}: ProfilePreferencesQuestionsProps) {
  const { toast } = useToast();

  const handlePreferenceChange = (key: string, value: boolean) => {
    onPreferenceChange({ [key]: value });
    toast({
      title: "Préférences mises à jour",
      description: "Vos préférences ont été enregistrées avec succès.",
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-burgundy">Vos centres d'intérêt</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="open-curtains" className="flex-1">
            Intéressé(e) par notre option rideau ouvert ?
          </Label>
          <Switch
            id="open-curtains"
            checked={openCurtainsInterest}
            onCheckedChange={(checked) => handlePreferenceChange("openCurtainsInterest", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="speed-dating" className="flex-1">
            Intéressé(e) de participer à nos sessions de speed dating ?
          </Label>
          <Switch
            id="speed-dating"
            checked={speedDatingInterest}
            onCheckedChange={(checked) => handlePreferenceChange("speedDatingInterest", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="libertine-party" className="flex-1">
            Intéressé(e) de participer à nos soirées libertines ?
          </Label>
          <Switch
            id="libertine-party"
            checked={libertinePartyInterest}
            onCheckedChange={(checked) => handlePreferenceChange("libertinePartyInterest", checked)}
          />
        </div>
      </div>
    </div>
  );
}