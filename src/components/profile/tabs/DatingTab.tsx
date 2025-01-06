import { ProfileForm } from "../form/ProfileForm";

interface DatingTabProps {
  profile: any;
  onUpdate: (updates: any) => Promise<void>;
}

export function DatingTab({ profile, onUpdate }: DatingTabProps) {
  return (
    <div className="p-6">
      <h3 className="text-2xl font-semibold text-burgundy mb-8">Mes Rencontres</h3>
      <ProfileForm profile={profile} onUpdate={onUpdate} />
    </div>
  );
}