
import { ProfileForm } from "../form/ProfileForm";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { QualificationJourney } from "@/components/qualification/QualificationJourney";

interface DatingTabProps {
  profile: any;
  onUpdate: (updates: any) => Promise<void>;
}

export function DatingTab({
  profile,
  onUpdate
}: DatingTabProps) {
  const [showQualification, setShowQualification] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async (updates: any) => {
    setIsSaving(true);
    try {
      await onUpdate(updates);
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (showQualification) {
    return <QualificationJourney isEditing onComplete={() => setShowQualification(false)} />;
  }

  return (
    <div className="p-0 w-full">
      <div className="mb-8">
        <Button onClick={() => setShowQualification(true)} className="w-full md:w-auto text-white bg-[#ce0067]">
          Modifier mes réponses de qualification
        </Button>
      </div>
      
      <div className="w-full">
        <ProfileForm 
          profile={profile} 
          onUpdate={handleUpdate}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}
