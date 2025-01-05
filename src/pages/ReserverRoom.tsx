import React from 'react';
import { ReservationHeader } from '@/components/reservation/ReservationHeader';
import { BookingModule } from '@/components/reservation/BookingModule';

const ReserverRoom = () => {
  return (
    <div className="w-full min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <ReservationHeader />
        <div className="booking-wrapper mt-4 w-[96%] mx-auto">
          <BookingModule />
        </div>

        <style>
          {`
            .booking-wrapper {
              position: relative;
              z-index: 1;
            }

            /* Reset any inherited styles */
            #lovehotel-booking * {
              all: revert;
              box-sizing: border-box;
            }

            /* Container styles */
            .booking-container {
              width: 100%;
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 240, 245, 0.95) 100%);
              border-radius: 1rem;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              overflow: hidden;
              position: relative;
              z-index: 1;
            }

            /* Booking module specific styles */
            #lovehotel-booking {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 1rem !important;
              position: relative !important;
              z-index: 1 !important;
            }

            /* Tab styles */
            #lovehotel-booking [role="tab"] {
              background: transparent !important;
              color: var(--primary) !important;
              padding: 0.75rem 1.5rem !important;
              border: 2px solid var(--primary) !important;
              border-radius: 0.75rem !important;
              margin-right: 0.75rem !important;
              cursor: pointer !important;
              transition: all 0.3s ease !important;
              font-weight: 500 !important;
              position: relative !important;
              z-index: 1 !important;
            }

            #lovehotel-booking [role="tab"]:hover {
              background: rgba(255, 52, 129, 0.05) !important;
              transform: translateY(-1px) !important;
            }

            #lovehotel-booking [role="tab"][aria-selected="true"] {
              background: linear-gradient(135deg, #FF3481 0%, #FF0066 100%) !important;
              color: white !important;
              border-color: transparent !important;
              box-shadow: 0 4px 12px rgba(255, 52, 129, 0.25) !important;
            }

            /* Form control styles */
            #lovehotel-booking input,
            #lovehotel-booking select {
              width: 100% !important;
              padding: 0.875rem !important;
              border: 2px solid rgba(255, 52, 129, 0.2) !important;
              border-radius: 0.75rem !important;
              background: white !important;
              transition: all 0.2s ease !important;
              font-size: 0.95rem !important;
              margin-bottom: 1rem !important;
              position: relative !important;
              z-index: 1 !important;
            }

            #lovehotel-booking input:focus,
            #lovehotel-booking select:focus {
              outline: none !important;
              border-color: #FF3481 !important;
              box-shadow: 0 0 0 3px rgba(255, 52, 129, 0.1) !important;
              transform: translateY(-1px) !important;
            }

            /* Button styles */
            #lovehotel-booking button {
              background: linear-gradient(135deg, #FF3481 0%, #FF0066 100%) !important;
              color: white !important;
              padding: 0.875rem 1.75rem !important;
              border-radius: 0.75rem !important;
              border: none !important;
              cursor: pointer !important;
              transition: all 0.3s ease !important;
              font-weight: 500 !important;
              text-transform: uppercase !important;
              letter-spacing: 0.5px !important;
              position: relative !important;
              overflow: hidden !important;
              width: auto !important;
              display: inline-flex !important;
              align-items: center !important;
              justify-content: center !important;
              z-index: 1 !important;
            }

            #lovehotel-booking button:hover {
              transform: translateY(-2px) !important;
              box-shadow: 0 6px 16px rgba(255, 52, 129, 0.3) !important;
            }

            /* Label styles */
            #lovehotel-booking label {
              color: var(--primary) !important;
              font-weight: 500 !important;
              margin-bottom: 0.5rem !important;
              display: block !important;
              font-size: 0.95rem !important;
              position: relative !important;
              z-index: 1 !important;
            }

            /* Responsive adjustments */
            @media (max-width: 768px) {
              #lovehotel-booking {
                padding: 0.75rem !important;
              }

              #lovehotel-booking [role="tab"] {
                padding: 0.625rem 1.25rem !important;
                font-size: 0.9rem !important;
              }

              #lovehotel-booking button {
                width: 100% !important;
                padding: 0.75rem 1rem !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default ReserverRoom;