import { useEffect } from 'react';

interface RideauxCalendarProps {
  calendarData: string;
}

export function RideauxCalendar({ calendarData }: RideauxCalendarProps) {
  useEffect(() => {
    // Add external CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://lovehotelaparis.fr/wp-content/plugins/lovehotel-users/assets/css/zlhu_front.css';
    document.head.appendChild(link);

    // Add external JavaScript
    const script = document.createElement('script');
    script.src = 'https://lovehotelaparis.fr/wp-content/plugins/lovehotel-users/assets/js/zlhu_front.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div 
      className="rideaux-calendar-container"
      dangerouslySetInnerHTML={{ __html: calendarData }}
    />
  );
}