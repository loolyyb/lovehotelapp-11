import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WidgetContainer } from "./WidgetContainer";
import { useToast } from "@/hooks/use-toast";

interface TokensSectionProps {
  tokens: number;
  onUpdate: (updates: any) => Promise<void>;
}

export function TokensSection({ tokens, onUpdate }: TokensSectionProps) {
  const { toast } = useToast();

  const handleLooLyybTokensChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const tokens = parseInt(event.target.value) || 0;
    if (tokens >= 0) {
      onUpdate({ loolyb_tokens: tokens });
      toast({
        title: "Tokens mis à jour",
        description: "Le nombre de tokens LooLyyb a été mis à jour avec succès.",
      });
    }
  };

  return (
    <WidgetContainer title="Tokens LooLyyb">
      <div className="space-y-4">
        <Label htmlFor="loolyb-tokens">Nombre de tokens en votre possession</Label>
        <Input
          id="loolyb-tokens"
          type="number"
          min="0"
          value={tokens || 0}
          onChange={handleLooLyybTokensChange}
          className="w-full"
          placeholder="Entrez le nombre de tokens LooLyyb"
        />
      </div>
    </WidgetContainer>
  );
}