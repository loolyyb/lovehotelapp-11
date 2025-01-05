import { useCallback } from 'react';
import { logger } from '@/services/LogService';

export const useLogger = (component: string) => {
  const withContext = useCallback((message: string, additionalContext?: Record<string, any>) => {
    return {
      component,
      ...additionalContext,
    };
  }, [component]);

  return {
    error: useCallback((message: string, context?: Record<string, any>) => {
      logger.error(message, withContext(message, context));
    }, [withContext]),

    warn: useCallback((message: string, context?: Record<string, any>) => {
      logger.warn(message, withContext(message, context));
    }, [withContext]),

    info: useCallback((message: string, context?: Record<string, any>) => {
      logger.info(message, withContext(message, context));
    }, [withContext]),

    debug: useCallback((message: string, context?: Record<string, any>) => {
      logger.debug(message, withContext(message, context));
    }, [withContext]),
  };
};