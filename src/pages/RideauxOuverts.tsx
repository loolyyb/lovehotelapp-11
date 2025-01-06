import React from 'react';
import { Card } from "@/components/ui/card";

const RideauxOuverts = () => {
  return (
    <div className="container mx-auto p-4 pt-8 min-h-screen">
      <Card className="w-full h-full overflow-hidden">
        <iframe 
          src="https://lovehotelaparis.fr/wp-json/zlhu_api/v3/rideaux_ouverts/"
          className="w-full min-h-screen border-0"
          title="Rideaux Ouverts"
        />
      </Card>
    </div>
  );
};

export default RideauxOuverts;