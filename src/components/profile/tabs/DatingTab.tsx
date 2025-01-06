import { ProfileForm } from "../form/ProfileForm";

interface DatingTabProps {
  profile: any;
  onUpdate: (updates: any) => Promise<void>;
}

export function DatingTab({ profile, onUpdate }: DatingTabProps) {
  return (
    <div className="p-6">
      <ProfileForm profile={profile} onUpdate={onUpdate} />
    </div>
  );
}