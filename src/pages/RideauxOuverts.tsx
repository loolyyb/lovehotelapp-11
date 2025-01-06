import React, { useState } from 'react';
import { Card } from "@/components/ui/card";

const RideauxOuverts = () => {
  const [iframeHeight, setIframeHeight] = useState('800px');

  const handleIframeLoad = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = event.currentTarget;
    try {
      // Try to get the content height
      const height = iframe.contentWindow?.document.documentElement.scrollHeight;
      if (height) {
        setIframeHeight(`${height}px`);
      }
    } catch (error) {
      console.log('Could not get iframe height, using default');
    }
  };

  return (
    <div className="container mx-auto p-4 pt-8">
      <Card className="w-full overflow-hidden">
        <iframe 
          src="https://lovehotelaparis.fr/wp-json/zlhu_api/v3/rideaux_ouverts/"
          className="w-full border-0"
          style={{ height: iframeHeight }}
          title="Rideaux Ouverts"
          onLoad={handleIframeLoad}
        />
      </Card>
    </div>
  );
};

export default RideauxOuverts;