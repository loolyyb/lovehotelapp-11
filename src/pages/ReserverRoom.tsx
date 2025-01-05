import React from 'react';
import { ReservationHeader } from '@/components/reservation/ReservationHeader';

const ReserverRoom = () => {
  return (
    <div className="w-full min-h-screen bg-background">
      <div className="w-full max-w-[1400px] mx-auto px-0 sm:px-1">
        <ReservationHeader />
      </div>
    </div>
  );
};

export default ReserverRoom;