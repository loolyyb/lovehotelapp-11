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
          /* Styles prioritaires pour notre application */
          #lovehotel-booking.booking-module {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
            padding: 2rem;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 240, 245, 0.95) 100%);
            border-radius: 1rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          /* Surcharge des styles pour les tabs avec une plus grande spécificité */
          #lovehotel-booking [role="tab"] {
            background: transparent;
            color: var(--primary);
            padding: 0.75rem 1.5rem;
            border: 2px solid var(--primary);
            border-radius: 0.75rem;
            margin-right: 0.75rem;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
          }

          #lovehotel-booking [role="tab"]:hover {
            background: rgba(255, 52, 129, 0.05);
            transform: translateY(-1px);
          }

          #lovehotel-booking [role="tab"][aria-selected="true"] {
            background: linear-gradient(135deg, #FF3481 0%, #FF0066 100%);
            color: white;
            border-color: transparent;
            box-shadow: 0 4px 12px rgba(255, 52, 129, 0.25);
          }

          /* Surcharge des styles pour les inputs avec une plus grande spécificité */
          #lovehotel-booking input,
          #lovehotel-booking select {
            width: 100%;
            padding: 0.875rem;
            border: 2px solid rgba(255, 52, 129, 0.2);
            border-radius: 0.75rem;
            background: white;
            transition: all 0.2s ease;
            font-size: 0.95rem;
          }

          #lovehotel-booking input:focus,
          #lovehotel-booking select:focus {
            outline: none;
            border-color: #FF3481;
            box-shadow: 0 0 0 3px rgba(255, 52, 129, 0.1);
            transform: translateY(-1px);
          }

          /* Surcharge des styles pour les boutons avec une plus grande spécificité */
          #lovehotel-booking button {
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
          }

          #lovehotel-booking button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(255, 52, 129, 0.3);
          }

          /* Styles pour les labels avec une plus grande spécificité */
          #lovehotel-booking label {
            color: var(--primary);
            font-weight: 500;
            margin-bottom: 0.5rem;
            display: block;
            font-size: 0.95rem;
          }

          /* Ajustements responsifs avec une plus grande spécificité */
          @media (max-width: 768px) {
            #lovehotel-booking.booking-module {
              padding: 1rem;
            }

            #lovehotel-booking [role="tab"] {
              padding: 0.625rem 1.25rem;
              font-size: 0.9rem;
            }

            #lovehotel-booking button {
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