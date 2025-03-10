
import { useEffect, useState } from 'react';
import { useLogger } from './useLogger';

export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(true);
  const [wasHidden, setWasHidden] = useState(false);
  const logger = useLogger('usePageVisibility');

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      logger.info(`Page visibility changed to ${visible ? 'visible' : 'hidden'}`);
      
      if (!visible) {
        setWasHidden(true);
      } else if (wasHidden) {
        // Only trigger this when transitioning from hidden to visible
        logger.info('Page is visible again after being hidden');
      }
      
      setIsVisible(visible);
    };

    // Initial check
    setIsVisible(document.visibilityState === 'visible');
    
    // Add event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [wasHidden, logger]);

  return { isVisible, wasHidden, setWasHidden };
}
