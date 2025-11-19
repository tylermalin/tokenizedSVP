import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from './errorHandler';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error: any) {
      const errors = error.errors?.map((e: any) => ({
        path: e.path.join('.'),
        message: e.message
      }));
      next(new AppError(`Validation error: ${errors?.[0]?.message || 'Invalid request'}`, 400));
    }
  };
};

