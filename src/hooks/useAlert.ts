import { useCallback } from 'react';
import { AlertService } from '@/services/AlertService';
import type { SeverityLevel } from '@sentry/react';

export const useAlert = (component: string) => {
  const withContext = useCallback((additionalContext?: Record<string, any>) => {
    return {
      component,
      ...additionalContext,
    };
  }, [component]);

  return {
    captureException: useCallback((error: Error, context?: Record<string, any>) => {
      AlertService.captureException(error, withContext(context));
    }, [withContext]),

    captureMessage: useCallback((message: string, level?: SeverityLevel, context?: Record<string, any>) => {
      AlertService.captureMessage(message, level, withContext(context));
    }, [withContext]),
  };
};