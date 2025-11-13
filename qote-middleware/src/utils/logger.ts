/**
 * Logger Utility
 * Handles logging to database and console
 */

import { getCurrentTimestamp } from "./time";

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error"
}

/**
 * Log entry structure
 */
export interface LogEntry {
  trace_id: string;
  session_id: string;
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

/**
 * Database logger interface
 * This will be implemented with actual Prisma client
 */
export interface ILogger {
  logEvent(entry: {
    trace_id: string;
    session_id: string;
    request: any;
    response: any;
  }): Promise<boolean>;

  logError(entry: {
    trace_id: string;
    session_id?: string;
    error: Error;
    context?: any;
  }): Promise<boolean>;
}

/**
 * Console logger (fallback when DB not available)
 */
class ConsoleLogger implements ILogger {
  async logEvent(entry: {
    trace_id: string;
    session_id: string;
    request: any;
    response: any;
  }): Promise<boolean> {
    console.log("[QOTE Event]", {
      trace_id: entry.trace_id,
      session_id: entry.session_id,
      timestamp: getCurrentTimestamp(),
      request_summary: {
        channel: entry.request.channel,
        user_role: entry.request.user_role,
        input_length: entry.request.input_text?.length
      },
      response_summary: {
        qote_state: entry.response.qote_metrics?.state,
        gating_mode: entry.response.gating_decision?.mode,
        safety_flags: entry.response.safety_flags?.length || 0
      }
    });

    return true;
  }

  async logError(entry: {
    trace_id: string;
    session_id?: string;
    error: Error;
    context?: any;
  }): Promise<boolean> {
    console.error("[QOTE Error]", {
      trace_id: entry.trace_id,
      session_id: entry.session_id,
      error: entry.error.message,
      stack: entry.error.stack,
      context: entry.context,
      timestamp: getCurrentTimestamp()
    });

    return true;
  }
}

/**
 * Prisma-based logger (production)
 * Uncomment and implement when Prisma is set up
 */
/*
import { PrismaClient } from "@prisma/client";

class PrismaLogger implements ILogger {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async logEvent(entry: {
    trace_id: string;
    session_id: string;
    request: any;
    response: any;
  }): Promise<boolean> {
    try {
      await this.prisma.qoteLog.create({
        data: {
          trace_id: entry.trace_id,
          session_id: entry.session_id,
          request: JSON.stringify(entry.request),
          response: JSON.stringify(entry.response),
          created_at: new Date()
        }
      });
      return true;
    } catch (error) {
      console.error("Failed to log event to database:", error);
      return false;
    }
  }

  async logError(entry: {
    trace_id: string;
    session_id?: string;
    error: Error;
    context?: any;
  }): Promise<boolean> {
    try {
      await this.prisma.errorLog.create({
        data: {
          trace_id: entry.trace_id,
          session_id: entry.session_id,
          error_message: entry.error.message,
          error_stack: entry.error.stack,
          context: JSON.stringify(entry.context),
          created_at: new Date()
        }
      });
      return true;
    } catch (error) {
      console.error("Failed to log error to database:", error);
      return false;
    }
  }
}
*/

/**
 * Get logger instance
 * Uses environment variable to determine which logger to use
 */
export function getLogger(): ILogger {
  // For now, use console logger
  // TODO: Switch to PrismaLogger when DATABASE_URL is configured
  if (process.env.DATABASE_URL) {
    // return new PrismaLogger();
  }

  return new ConsoleLogger();
}

/**
 * Convenience function for logging events
 */
export async function logEvent(entry: {
  trace_id: string;
  session_id: string;
  request: any;
  response: any;
}): Promise<boolean> {
  const logger = getLogger();
  return logger.logEvent(entry);
}

/**
 * Convenience function for logging errors
 */
export async function logError(entry: {
  trace_id: string;
  session_id?: string;
  error: Error;
  context?: any;
}): Promise<boolean> {
  const logger = getLogger();
  return logger.logError(entry);
}

/**
 * Simple console log for debugging
 */
export function debugLog(message: string, data?: any) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[QOTE Debug] ${message}`, data || "");
  }
}
