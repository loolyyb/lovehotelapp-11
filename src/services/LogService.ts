
import { supabase } from "@/integrations/supabase/client";

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  user_id?: string;
  route?: string;
}

class LogService {
  private static instance: LogService;
  private isDevelopment = import.meta.env.DEV;
  private logQueue: LogEntry[] = [];
  private isProcessingQueue = false;
  private batchSize = 10;
  private processInterval = 5000; // 5 secondes
  private lastLogTimestamps: Record<LogLevel, number> = {
    error: 0,
    warn: 0,
    info: 0,
    debug: 0
  };
  private throttleIntervals: Record<LogLevel, number> = {
    error: 0,     // Pas de throttling pour les erreurs
    warn: 1000,   // 1 seconde
    info: 2000,   // 2 secondes
    debug: 5000   // 5 secondes
  };

  private constructor() {
    // Démarrer le traitement périodique de la file d'attente
    setInterval(() => this.processQueue(), this.processInterval);
  }

  static getInstance(): LogService {
    if (!LogService.instance) {
      LogService.instance = new LogService();
    }
    return LogService.instance;
  }

  private shouldThrottle(level: LogLevel): boolean {
    const now = Date.now();
    const lastLog = this.lastLogTimestamps[level];
    const throttleInterval = this.throttleIntervals[level];

    if (now - lastLog < throttleInterval) {
      return true;
    }

    this.lastLogTimestamps[level] = now;
    return false;
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.logQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      while (this.logQueue.length > 0) {
        const batch = this.logQueue.splice(0, this.batchSize);
        
        const { error } = await supabase
          .from('application_logs')
          .insert(batch);

        if (error) {
          // En cas d'erreur, remettre les logs dans la file d'attente
          this.logQueue.unshift(...batch);
          console.error('Erreur lors de la persistance du batch de logs:', error);
          break; // Sortir de la boucle pour réessayer plus tard
        }
      }
    } catch (error) {
      console.error('Erreur critique lors du traitement de la file d\'attente:', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `\nContexte: ${JSON.stringify(context, null, 2)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private async createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): Promise<LogEntry> {
    const { data: { user } } = await supabase.auth.getUser();
    const user_id = user?.id;

    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      user_id,
      route: window.location.pathname,
    };
  }

  private queueLog(entry: LogEntry) {
    this.logQueue.push(entry);
    
    // Si la file d'attente devient trop grande, traiter immédiatement
    if (this.logQueue.length >= this.batchSize) {
      this.processQueue();
    }
  }

  async error(message: string, context?: Record<string, any>) {
    const formattedMessage = this.formatMessage('error', message, context);
    console.error(formattedMessage);
    
    const entry = await this.createLogEntry('error', message, context);
    // Les erreurs sont toujours enregistrées immédiatement
    this.queueLog(entry);
  }

  async warn(message: string, context?: Record<string, any>) {
    if (this.shouldThrottle('warn')) {
      return;
    }

    const formattedMessage = this.formatMessage('warn', message, context);
    console.warn(formattedMessage);
    
    if (!this.isDevelopment) {
      const entry = await this.createLogEntry('warn', message, context);
      this.queueLog(entry);
    }
  }

  async info(message: string, context?: Record<string, any>) {
    if (this.shouldThrottle('info')) {
      return;
    }

    const formattedMessage = this.formatMessage('info', message, context);
    console.info(formattedMessage);
    
    if (!this.isDevelopment) {
      const entry = await this.createLogEntry('info', message, context);
      this.queueLog(entry);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    if (this.isDevelopment && !this.shouldThrottle('debug')) {
      const formattedMessage = this.formatMessage('debug', message, context);
      console.debug(formattedMessage);
    }
  }
}

export const logger = LogService.getInstance();
