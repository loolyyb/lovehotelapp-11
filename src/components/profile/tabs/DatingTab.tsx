
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
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldChange = (field: string, value: any) => {
    setPendingChanges(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) return;

    setIsSaving(true);
    try {
      await onUpdate(pendingChanges);
      setPendingChanges({});
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
          onUpdate={handleSaveChanges}
          onChange={handleFieldChange}
          pendingChanges={pendingChanges}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}
