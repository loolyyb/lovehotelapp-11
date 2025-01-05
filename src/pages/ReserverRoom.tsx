import React, { useEffect } from 'react';
import { BedDouble } from "lucide-react";

const ReserverRoom = () => {
  useEffect(() => {
    // Add script dynamically
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://booking.lovehotel.io/assets/index.js';
    document.body.appendChild(script);

    // Add stylesheet dynamically
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://booking.lovehotel.io/assets/index.css';
    document.head.appendChild(link);

    // Cleanup function
    return () => {
      document.body.removeChild(script);
      document.head.removeChild(link);
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="w-full px-2 py-4 md:container md:mx-auto md:px-4 md:py-8">
      <div className="w-full md:max-w-4xl md:mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <BedDouble className="h-6 w-6 text-burgundy" />
            <h1 className="text-2xl font-cormorant text-burgundy">Réserver une Love Room</h1>
          </div>
          
          <div className="w-full">
            <div id="lovehotel-booking" className="w-full min-h-[800px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReserverRoom;