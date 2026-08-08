import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { env } from '../config/env';

// Initialize Sentry if SENTRY_DSN is configured
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
  console.log('[Sentry] Error tracking initialized');
}

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Production-Ready Global Error Handling Middleware
 */
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // 1. Log error to Sentry in production or when DSN is present
  if (process.env.SENTRY_DSN || env.NODE_ENV === 'production') {
    Sentry.withScope((scope) => {
      scope.setUser({ id: req.user?.id || 'anonymous' });
      scope.setExtra('url', req.originalUrl);
      scope.setExtra('method', req.method);
      scope.setExtra('body', req.body);
      Sentry.captureException(err);
    });
  }

  // Log to console for debugging
  console.error(`[Error] ${req.method} ${req.originalUrl} - Status: ${statusCode} - ${message}`);
  if (env.NODE_ENV === 'development' && err.stack) {
    console.error(err.stack);
  }

  // 2. Return clean sanitized JSON error response
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && env.NODE_ENV === 'production'
      ? 'An unexpected server error occurred. Please try again later.'
      : message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
