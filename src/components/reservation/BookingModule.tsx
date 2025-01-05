import React from 'react';

export const BookingModule = () => {
  return (
    <div className="booking-container mt-4">
      <iframe 
        src="https://booking.lovehotel.io" 
        className="w-full min-h-[800px] border-none rounded-xl shadow-lg"
        title="Love Hotel Booking"
      />
    </div>
  );
};