import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';
import { HTTP_STATUS } from '../config/constants';
import { logger } from '../config/logger.config';
import { env } from '../config/env.config';

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
  path?: string;
  value?: unknown;
}

export const errorHandler = (
  err: Error | AppError | MongoError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';
  let errors: unknown[] | undefined;

  // Known AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }
  // Mongoose CastError (invalid ObjectId)
  else if (err.name === 'CastError') {
    const mongoErr = err as MongoError;
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `Invalid format for resource identifier: ${mongoErr.value}`;
  }
  // Mongoose Duplicate Key Error
  else if ('code' in err && err.code === 11000) {
    const mongoErr = err as MongoError;
    const field = mongoErr.keyValue ? Object.keys(mongoErr.keyValue).join(', ') : 'field';
    statusCode = HTTP_STATUS.CONFLICT;
    message = `Duplicate value entered for ${field}. It must be unique.`;
  }
  // Mongoose Validation Error
  else if (err.name === 'ValidationError') {
    const mongoErr = err as MongoError;
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message = 'Database validation failed';
    if (mongoErr.errors) {
      errors = Object.values(mongoErr.errors).map((e) => e.message);
    }
  }
  // SyntaxError from body-parser (e.g. invalid JSON)
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Malformed JSON payload received in request';
  } else {
    message = env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message;
  }

  logger.error(
    {
      method: req.method,
      path: req.originalUrl,
      statusCode,
      message,
      errorStack: env.NODE_ENV !== 'production' ? err.stack : undefined,
    },
    'Request Error Handled'
  );

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(errors ? { errors } : {}),
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
