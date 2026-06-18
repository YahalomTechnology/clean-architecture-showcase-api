import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestError } from '../core/errors/CustomError.js';

export function validateRequest(schema: AnyZodObject) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        const issues = err.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
        return next(new BadRequestError(`Validation failure - ${issues}`));
      }
      next(err);
    }
  };
}
