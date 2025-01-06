import { supabase } from "@/integrations/supabase/client";

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  userId?: string;
  route?: string;
}

class LogService {
  private static instance: LogService;
  private isDevelopment = import.meta.env.DEV;

  private constructor() {}

  static getInstance(): LogService {
    if (!LogService.instance) {
      LogService.instance = new LogService();
    }
    return LogService.instance;
  }

  private async persistLog(entry: LogEntry) {
    try {
      const { error } = await supabase
        .from('application_logs')
        .insert([entry]);

      if (error) {
        console.error('Erreur lors de la persistance du log:', error);
      }
    } catch (error) {
      console.error('Erreur critique lors de la persistance du log:', error);
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
    const userId = user?.id;

    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      userId,
      route: window.location.pathname,
    };
  }

  async error(message: string, context?: Record<string, any>) {
    const formattedMessage = this.formatMessage('error', message, context);
    console.error(formattedMessage);
    
    const entry = await this.createLogEntry('error', message, context);
    await this.persistLog(entry);
  }

  async warn(message: string, context?: Record<string, any>) {
    const formattedMessage = this.formatMessage('warn', message, context);
    console.warn(formattedMessage);
    
    if (!this.isDevelopment) {
      const entry = await this.createLogEntry('warn', message, context);
      await this.persistLog(entry);
    }
  }

  async info(message: string, context?: Record<string, any>) {
    const formattedMessage = this.formatMessage('info', message, context);
    console.info(formattedMessage);
    
    if (!this.isDevelopment) {
      const entry = await this.createLogEntry('info', message, context);
      await this.persistLog(entry);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    if (this.isDevelopment) {
      const formattedMessage = this.formatMessage('debug', message, context);
      console.debug(formattedMessage);
    }
  }
}

export const logger = LogService.getInstance();