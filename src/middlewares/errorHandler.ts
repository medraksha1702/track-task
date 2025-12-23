import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ValidationError, UniqueConstraintError } from 'sequelize';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    });
    return;
  }

  // Handle Sequelize validation errors
  if (err instanceof ValidationError) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        details: err.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      },
    });
    return;
  }

  // Handle Sequelize unique constraint errors
  if (err instanceof UniqueConstraintError) {
    res.status(409).json({
      success: false,
      error: {
        message: 'A record with this value already exists',
        details: err.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      },
    });
    return;
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        details: (err as any).errors,
      },
    });
    return;
  }

  // Default error
  res.status(500).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

