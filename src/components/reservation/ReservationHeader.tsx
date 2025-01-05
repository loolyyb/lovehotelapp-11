import { BedDouble } from "lucide-react";

export const ReservationHeader = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <BedDouble className="h-8 w-8 text-rose-500" />
        <h1 className="text-3xl font-cormorant font-semibold text-primary">
          Réserver une Love Room
        </h1>
      </div>
    </div>
  );
};