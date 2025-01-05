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
    document.head.appendChild(link);

    return () => {
      document.body.removeChild(script);
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="container mx-auto px-4 py-8">
        <div className="w-full max-w-none">
          <div className="bg-white rounded-lg shadow-md p-3 md:p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <BedDouble className="h-6 w-6 text-burgundy" />
              <h1 className="text-2xl font-cormorant text-burgundy">Réserver une Love Room</h1>
            </div>
            
            <div className="w-full max-w-none">
              <div id="lovehotel-booking" style={{ width: '100%', maxWidth: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReserverRoom;