
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WidgetContainer } from "./WidgetContainer";

interface TokensSectionProps {
  tokens: number;
  onUpdate: (value: any) => void;  // Changed from Promise<void> to void
}

export function TokensSection({ tokens, onUpdate }: TokensSectionProps) {
  const handleLooLyybTokensChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const tokens = parseInt(event.target.value) || 0;
    if (tokens >= 0) {
      onUpdate({ loolyb_tokens: tokens });
    }
  };

  return (
    <WidgetContainer title="Tokens LooLyyb">
      <div className="space-y-4 text-[#f3ebad]">
        <Label htmlFor="loolyb-tokens" className="text-[#f3ebad]">
          Nombre de tokens en votre possession (à partir de mars 2025)
        </Label>
        <Input
          id="loolyb-tokens"
          type="number"
          min="0"
          value={tokens || 0}
          onChange={handleLooLyybTokensChange}
          placeholder="Entrez le nombre de tokens LooLyyb"
          className="w-full bg-white/10 text-[#f3ebad] border-[#f3ebad]/30"
        />
      </div>
    </WidgetContainer>
  );
}
