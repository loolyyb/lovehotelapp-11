import React, { useEffect } from 'react';

export const BookingModule = () => {
  useEffect(() => {
    // Cleanup old script and stylesheet if they exist
    const oldScript = document.querySelector('script[src="https://booking.lovehotel.io/assets/index.js"]');
    const oldStylesheet = document.querySelector('link[href="https://booking.lovehotel.io/assets/index.css"]');
    
    if (oldScript) oldScript.remove();
    if (oldStylesheet) oldStylesheet.remove();

    // Add stylesheet
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'https://booking.lovehotel.io/assets/index.css';
    document.head.appendChild(stylesheet);

    // Add script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://booking.lovehotel.io/assets/index.js';
    document.body.appendChild(script);

    return () => {
      // Cleanup on component unmount
      script.remove();
      stylesheet.remove();
    };
  }, []);

  return (
    <div className="booking-container">
      <div id="lovehotel-booking" />
    </div>
  );
};