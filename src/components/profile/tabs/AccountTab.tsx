import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ProfileHeader } from "../ProfileHeader";

interface AccountTabProps {
  profile: any;
  onUpdate: (updates: any) => Promise<void>;
}

export function AccountTab({ profile, onUpdate }: AccountTabProps) {
  const { toast } = useToast();

  const handleFullNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ full_name: event.target.value });
    toast({
      title: "Nom mis à jour",
      description: "Votre nom a été modifié avec succès.",
    });
  };

  return (
    <div className="space-y-8">
      <ProfileHeader
        avatarUrl={profile?.avatar_url}
        fullName={profile?.full_name}
        bio={profile?.bio}
        canEdit={true}
        onAvatarChange={(url) => onUpdate({ avatar_url: url })}
      />

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="full-name">Nom complet</Label>
            <Input
              id="full-name"
              value={profile?.full_name || ""}
              onChange={handleFullNameChange}
              placeholder="Votre nom complet"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile?.email || ""}
              disabled
              className="bg-gray-100"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}