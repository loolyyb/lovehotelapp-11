import { BedDouble } from "lucide-react";

export const ReservationHeader = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 mb-1">
      <div className="flex items-center gap-3">
        <BedDouble className="h-8 w-8 text-rose-500" />
        <h1 className="text-3xl font-cormorant font-semibold text-primary">
          Réserver une Love Room
        </h1>
      </div>
    </div>
  );
};