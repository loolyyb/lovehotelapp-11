import React from 'react';
import { BedDouble } from "lucide-react";

const ReserverRoom = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <BedDouble className="h-6 w-6 text-burgundy" />
            <h1 className="text-2xl font-cormorant text-burgundy">Réserver une Love Room</h1>
          </div>
          
          <div className="w-full">
            <iframe 
              src="https://lovehotelaparis.fr/reserver-une-chambre/" 
              className="w-full min-h-[800px] border-0"
              title="Réservation Love Room"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReserverRoom;