import React from 'react';
import { ReservationHeader } from '@/components/reservation/ReservationHeader';

const ReserverRoom = () => {
  return (
    <div className="w-full min-h-screen bg-background">
      <div className="container mx-auto px-1">
        <ReservationHeader />
      </div>
    </div>
  );
};

export default ReserverRoom;