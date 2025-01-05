import React, { useEffect } from 'react';

export const BookingModule = () => {
  useEffect(() => {
    // Nettoyage de l'ancien script s'il existe
    const oldScript = document.querySelector('script[src="https://booking.lovehotel.io/assets/index.js"]');
    if (oldScript) {
      oldScript.remove();
    }

    // Création et ajout du nouveau script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://booking.lovehotel.io/assets/index.js';
    document.body.appendChild(script);

    return () => {
      // Nettoyage lors du démontage du composant
      script.remove();
    };
  }, []);

  return (
    <div className="booking-container">
      <div id="lovehotel-booking" className="booking-module" />
    </div>
  );
};