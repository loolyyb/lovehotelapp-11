import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/profile/form/ProfileForm";
import { Save } from "lucide-react";

interface AccountTabProps {
  profile: any;
  onUpdate: (updates: any) => Promise<void>;
}

export function AccountTab({ profile, onUpdate }: AccountTabProps) {
  return (
    <>
      <ProfileForm
        profile={profile}
        onUpdate={onUpdate}
      />
      <div className="pt-8 flex justify-center">
        <Button 
          onClick={() => onUpdate(profile)}
          className="px-8 py-6 text-lg bg-burgundy hover:bg-burgundy/90 text-white flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Enregistrer les modifications
        </Button>
      </div>
    </>
  );
}