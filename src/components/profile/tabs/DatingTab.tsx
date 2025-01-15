import { ProfileForm } from "../form/ProfileForm";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { QualificationJourney } from "@/components/qualification/QualificationJourney";

interface DatingTabProps {
  profile: any;
  onUpdate: (updates: any) => Promise<void>;
}

export function DatingTab({ profile, onUpdate }: DatingTabProps) {
  const [showQualification, setShowQualification] = useState(false);

  if (showQualification) {
    return <QualificationJourney isEditing onComplete={() => setShowQualification(false)} />;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <Button
          onClick={() => setShowQualification(true)}
          className="w-full md:w-auto bg-rose-500 hover:bg-rose-600 text-white"
        >
          Modifier mes réponses de qualification
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ProfileForm profile={profile} onUpdate={onUpdate} />
      </div>
    </div>
  );
}