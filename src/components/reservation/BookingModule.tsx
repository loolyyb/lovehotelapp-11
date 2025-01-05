import React, { useEffect } from 'react';

export const BookingModule = () => {
  useEffect(() => {
    // Cleanup old script if it exists
    const oldScript = document.querySelector('script[src="https://booking.lovehotel.io/assets/index.js"]');
    if (oldScript) {
      oldScript.remove();
    }

    // Create and add new script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://booking.lovehotel.io/assets/index.js';
    document.body.appendChild(script);

    return () => {
      // Cleanup on component unmount
      script.remove();
    };
  }, []);

  return (
    <div className="booking-container mt-2">
      <div id="lovehotel-booking" className="booking-module" />
    </div>
  );
};