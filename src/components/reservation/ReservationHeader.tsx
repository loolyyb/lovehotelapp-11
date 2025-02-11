import { BedDouble } from "lucide-react";

export const ReservationHeader = () => {
  return (
    <div className="backdrop-blur-sm rounded-xl shadow-lg p-4">
      <div className="flex items-center gap-3 mb-4">
        <BedDouble className="h-8 w-8 text-rose-500" />
        <h1 className="text-3xl font-cormorant font-semibold text-rose-500">
          Réserver une Love Room
        </h1>
      </div>
      <iframe 
        src="https://booking.lovehotel.io" 
        className="w-full min-h-[800px] border-none rounded-xl shadow-lg"
        style={{ minWidth: '100%', width: '100%' }}
        title="Love Hotel Booking"
      />
    </div>
  );
};
