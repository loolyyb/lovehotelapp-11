import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SummaryProps {
  onNext: (data: any) => void;
  formData: any;
  loading?: boolean;
}

export function Summary({ onNext, formData, loading }: SummaryProps) {
  const handleSubmit = () => {
    onNext(formData);
  };

  const renderSection = (title: string, data: any) => {
    if (!data) return null;
    
    return (
      <div className="space-y-2">
        <h3 className="font-semibold text-burgundy">{title}</h3>
        {Array.isArray(data) ? (
          <ul className="list-disc list-inside">
            {data.map((item, index) => (
              <li key={index} className="text-gray-600">{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">{data}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-burgundy">
        Récapitulatif de vos préférences
      </h2>

      <ScrollArea className="h-[400px] rounded-md border p-4">
        <div className="space-y-6">
          {renderSection("Statut", formData.status)}
          {renderSection("Motivations", formData.motivations)}
          {renderSection("Centres d'intérêt", formData.interests)}
          
          {formData.preferences && Object.entries(formData.preferences).map(([category, values]) => (
            renderSection(
              category === 'open_curtains' ? 'Préférences Rideaux Ouverts' : category,
              values
            )
          ))}
        </div>
      </ScrollArea>

      <div className="flex justify-end space-x-4">
        <Button
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Enregistrement..." : "Valider"}
        </Button>
      </div>
    </div>
  );
}