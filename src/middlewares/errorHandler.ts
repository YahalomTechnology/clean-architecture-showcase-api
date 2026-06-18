import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../core/errors/CustomError.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof CustomError) {
    console.warn(`⚠️ [API Error] ${req.method} ${req.path} - ${err.statusCode}:`, err.message);
    return res.status(err.statusCode).json({ errors: err.serializeErrors() });
  }

  // Unhandled internal exceptions
  console.error(`💥 [Unhandled Exception] ${req.method} ${req.path}:`, err);

  return res.status(500).json({
    errors: [{ message: 'Something went wrong internally. Please try again.' }],
  });
}
