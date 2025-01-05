import React, { useEffect } from 'react';
import { BedDouble } from "lucide-react";

const ReserverRoom = () => {
  useEffect(() => {
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
            <BedDouble className="h-6 w-6 text-rose-500" />
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
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 240, 245, 0.9) 100%);
            border-radius: var(--radius);
          }

          /* Style tabs */
          .booking-module [role="tab"] {
            background: transparent;
            color: var(--primary);
            padding: 0.75rem 1.5rem;
            border: 1px solid var(--border);
            border-radius: var(--radius);
            margin-right: 0.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
            font-weight: 500;
          }

          .booking-module [role="tab"]:hover {
            background: rgba(255, 52, 129, 0.05);
          }

          .booking-module [role="tab"][aria-selected="true"] {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
            box-shadow: 0 2px 4px rgba(255, 52, 129, 0.2);
          }

          /* Style inputs */
          .booking-module input,
          .booking-module select {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid var(--border);
            border-radius: var(--radius);
            margin-bottom: 1rem;
            background: white;
            transition: border-color 0.2s ease;
          }

          .booking-module input:focus,
          .booking-module select:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 2px rgba(255, 52, 129, 0.1);
          }

          /* Style buttons */
          .booking-module button {
            background: linear-gradient(135deg, #FF3481 0%, #FF0066 100%);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: var(--radius);
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 4px rgba(255, 52, 129, 0.2);
          }

          .booking-module button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 6px rgba(255, 52, 129, 0.3);
          }

          .booking-module button:active {
            transform: translateY(0);
          }

          /* Style labels and text */
          .booking-module label {
            color: var(--primary);
            font-weight: 500;
            margin-bottom: 0.5rem;
            display: block;
          }

          /* Add subtle animations */
          .booking-module > div {
            animation: fadeIn 0.3s ease-out;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(5px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Ensure proper spacing */
          .booking-module > div {
            margin-bottom: 1.5rem;
          }

          /* Fix header positioning */
          header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 50;
            background: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          /* Ensure content starts below header */
          main {
            padding-top: 4.5rem;
          }

          /* Reset any conflicting styles */
          #root {
            padding: 0;
          }

          /* Add a subtle shine effect to buttons */
          .booking-module button::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              to right,
              transparent 0%,
              rgba(255, 255, 255, 0.2) 50%,
              transparent 100%
            );
            animation: shine 3s infinite;
          }

          @keyframes shine {
            to {
              left: 200%;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ReserverRoom;