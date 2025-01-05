import * as Sentry from "@sentry/react";
import { logger } from './LogService';

class AlertService {
  static captureException(error: Error, context?: Record<string, any>) {
    // Log l'erreur localement
    logger.error(error.message, {
      error: error.stack,
      ...context
    });

    // Envoie l'erreur à Sentry
    Sentry.captureException(error, {
      extra: context
    });
  }

  static captureMessage(message: string, level: Sentry.SeverityLevel = "info", context?: Record<string, any>) {
    // Log le message localement
    logger.info(message, context);

    // Envoie le message à Sentry
    Sentry.captureMessage(message, {
      level,
      extra: context
    });
  }
}

export { AlertService };