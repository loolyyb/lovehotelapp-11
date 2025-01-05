import React, { useEffect } from 'react';
import { ReservationHeader } from '@/components/reservation/ReservationHeader';
import { BookingModule } from '@/components/reservation/BookingModule';

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
    <div className="w-full min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4">
        <ReservationHeader />
        <BookingModule />
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
            padding: 2rem;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 240, 245, 0.95) 100%);
            border-radius: 1rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          /* Style tabs */
          .booking-module [role="tab"] {
            background: transparent;
            color: var(--primary);
            padding: 0.75rem 1.5rem;
            border: 2px solid var(--primary);
            border-radius: 0.75rem;
            margin-right: 0.75rem;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
            position: relative;
            overflow: hidden;
          }

          .booking-module [role="tab"]:hover {
            background: rgba(255, 52, 129, 0.05);
            transform: translateY(-1px);
          }

          .booking-module [role="tab"][aria-selected="true"] {
            background: linear-gradient(135deg, #FF3481 0%, #FF0066 100%);
            color: white;
            border-color: transparent;
            box-shadow: 0 4px 12px rgba(255, 52, 129, 0.25);
          }

          /* Style inputs */
          .booking-module input,
          .booking-module select {
            width: 100%;
            padding: 0.875rem;
            border: 2px solid rgba(255, 52, 129, 0.2);
            border-radius: 0.75rem;
            margin-bottom: 1rem;
            background: white;
            transition: all 0.2s ease;
            font-size: 0.95rem;
          }

          .booking-module input:focus,
          .booking-module select:focus {
            outline: none;
            border-color: #FF3481;
            box-shadow: 0 0 0 3px rgba(255, 52, 129, 0.1);
            transform: translateY(-1px);
          }

          /* Style buttons */
          .booking-module button {
            background: linear-gradient(135deg, #FF3481 0%, #FF0066 100%);
            color: white;
            padding: 0.875rem 1.75rem;
            border-radius: 0.75rem;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(255, 52, 129, 0.25);
          }

          .booking-module button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(255, 52, 129, 0.3);
          }

          .booking-module button:active {
            transform: translateY(0);
          }

          /* Add shine effect to buttons */
          .booking-module button::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
              45deg,
              transparent 0%,
              rgba(255, 255, 255, 0.1) 50%,
              transparent 100%
            );
            transform: rotate(45deg);
            animation: shine 3s infinite;
          }

          @keyframes shine {
            0% {
              transform: translateX(-100%) rotate(45deg);
            }
            100% {
              transform: translateX(100%) rotate(45deg);
            }
          }

          /* Style labels and text */
          .booking-module label {
            color: var(--primary);
            font-weight: 500;
            margin-bottom: 0.5rem;
            display: block;
            font-size: 0.95rem;
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

          /* Responsive adjustments */
          @media (max-width: 768px) {
            .booking-module {
              padding: 1rem;
            }

            .booking-module [role="tab"] {
              padding: 0.625rem 1.25rem;
              font-size: 0.9rem;
            }

            .booking-module button {
              width: 100%;
              padding: 0.75rem 1rem;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ReserverRoom;