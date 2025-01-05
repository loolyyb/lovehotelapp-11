import React, { useEffect } from 'react';
import { BedDouble } from "lucide-react";

const ReserverRoom = () => {
  useEffect(() => {
    // Load only the JavaScript, not the CSS
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://booking.lovehotel.io/assets/index.js';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []); 

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-20">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <BedDouble className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-cormorant text-primary">Réserver une Love Room</h1>
          </div>
          
          <div className="w-full">
            <div id="lovehotel-booking" className="booking-module" />
          </div>
        </div>
      </div>

      <style>
        {`
          /* Reset all external styles */
          #lovehotel-booking * {
            all: revert;
            font-family: 'Montserrat', sans-serif;
          }

          /* Custom styling for the booking module */
          .booking-module {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
            padding: 1rem;
          }

          /* Style tabs */
          .booking-module [role="tab"] {
            background: var(--background);
            color: var(--primary);
            padding: 0.5rem 1rem;
            border: 1px solid var(--border);
            border-radius: var(--radius);
            margin-right: 0.5rem;
            cursor: pointer;
          }

          .booking-module [role="tab"][aria-selected="true"] {
            background: var(--primary);
            color: white;
          }

          /* Style inputs */
          .booking-module input,
          .booking-module select {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid var(--border);
            border-radius: var(--radius);
            margin-bottom: 1rem;
          }

          /* Style buttons */
          .booking-module button {
            background: var(--primary);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: var(--radius);
            border: none;
            cursor: pointer;
            transition: opacity 0.2s;
          }

          .booking-module button:hover {
            opacity: 0.9;
          }

          /* Ensure proper spacing */
          .booking-module > div {
            margin-bottom: 1rem;
          }

          /* Fix header positioning */
          header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 50;
            background: white;
          }

          /* Ensure content starts below header */
          main {
            padding-top: 4.5rem;
          }

          /* Reset any conflicting styles */
          #root {
            padding: 0;
          }
        `}
      </style>
    </div>
  );
};

export default ReserverRoom;