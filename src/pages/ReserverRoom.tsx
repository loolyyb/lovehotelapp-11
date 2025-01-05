import React, { useEffect } from 'react';
import { BedDouble } from "lucide-react";

const ReserverRoom = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://booking.lovehotel.io/assets/index.js';
    document.body.appendChild(script);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://booking.lovehotel.io/assets/index.css';
    link.id = 'booking-styles';
    document.head.appendChild(link);

    return () => {
      document.body.removeChild(script);
      const styleSheet = document.getElementById('booking-styles');
      if (styleSheet) {
        document.head.removeChild(styleSheet);
      }
    };
  }, []); 

  return (
    <div className="booking-page-container relative w-full">
      <div className="booking-content px-4 py-4 w-full max-w-full overflow-x-hidden">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <BedDouble className="h-6 w-6 text-burgundy" />
            <h1 className="text-2xl font-cormorant text-burgundy">Réserver une Love Room</h1>
          </div>
          
          <div className="booking-module-container w-full">
            <div id="lovehotel-booking" className="w-full min-h-[800px]" />
          </div>
        </div>
      </div>

      <style>
        {`
          .booking-page-container {
            position: relative;
            width: 100%;
            margin: 0;
            padding: 0;
          }

          .booking-content {
            position: relative;
            margin-top: 4.5rem;
            padding-top: 1rem;
            z-index: 1;
          }

          .booking-module-container {
            width: 100%;
            max-width: 100%;
            overflow-x: hidden;
            position: relative;
            z-index: 1;
          }

          #lovehotel-booking {
            all: revert;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Ensure the header stays fixed and above the booking module */
          header {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 50 !important;
            background: white !important;
          }

          /* Reset any root padding that might interfere */
          #root {
            padding-top: 0 !important;
          }

          /* Ensure the booking module doesn't affect global styles */
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
        `}
      </style>
    </div>
  );
};

export default ReserverRoom;