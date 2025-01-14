import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WidgetContainer } from "./WidgetContainer";

interface TokensSectionProps {
  tokens?: number;
  onUpdate: (updates: any) => Promise<void>;
}

export function TokensSection({ tokens = 0, onUpdate }: TokensSectionProps) {
  const handleAddTokens = async () => {
    await onUpdate({ loolyb_tokens: tokens + 1 });
  };

  return (
    <WidgetContainer title="LooLyyb Tokens">
      <Card className="relative overflow-hidden p-6 bg-gradient-to-r from-rose-100 to-burgundy-100">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-4xl font-bold text-burgundy-800">{tokens}</div>
          <div className="text-sm text-burgundy-600">Tokens disponibles</div>
          <Button 
            onClick={handleAddTokens}
            className="bg-burgundy-600 hover:bg-burgundy-700 text-white"
          >
            Ajouter des tokens
          </Button>
        </div>
      </Card>
    </WidgetContainer>
  );
}