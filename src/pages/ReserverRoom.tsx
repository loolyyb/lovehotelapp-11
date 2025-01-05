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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <BedDouble className="h-6 w-6 text-booking-primary" />
            <h1 className="text-2xl font-cormorant text-booking-primary">Réserver une Love Room</h1>
          </div>
          
          <div className="mb-8 text-gray-600 font-montserrat">
            <p className="mb-4">
              Découvrez nos Love Rooms, des espaces intimes et élégants répartis entre nos deux établissements parisiens :
            </p>
            <ul className="mb-4 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-booking-primary">•</span>
                <span>18 Love Rooms à Châtelet, au cœur de Paris</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-booking-primary">•</span>
                <span>7 Love Rooms à Pigalle, quartier mythique de la capitale</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-booking-primary">•</span>
                <span>2 suites avec jacuzzi privatif pour des moments d'exception</span>
              </li>
            </ul>
            <p>Réservez dès maintenant votre Love Room et vivez une expérience unique dans un cadre raffiné et discret.</p>
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