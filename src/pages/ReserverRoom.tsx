import React, { useEffect } from 'react';
import { BedDouble } from "lucide-react";

const ReserverRoom = () => {
  useEffect(() => {
    // Add script dynamically
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://booking.lovehotel.io/assets/index.js';
    document.body.appendChild(script);

    // Add stylesheet dynamically with a unique identifier
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://booking.lovehotel.io/assets/index.css';
    link.id = 'booking-styles';
    document.head.appendChild(link);

    // Cleanup function
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

      <style jsx global>{`
        /* Isolate booking styles to prevent them from affecting the header */
        .booking-page-container {
          position: relative;
          width: 100%;
          margin-top: 0;
          padding-top: 0;
        }

        /* Override any padding that might affect the header */
        .booking-content {
          position: relative;
          z-index: 1;
        }

        /* Ensure the booking module container doesn't affect layout */
        .booking-module-container {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }

        /* Reset any global styles that might be added by the booking script */
        #lovehotel-booking {
          all: revert;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default ReserverRoom;