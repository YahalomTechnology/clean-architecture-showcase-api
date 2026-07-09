import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestError } from '../core/errors/CustomError.js';

export function validateRequest(schema: AnyZodObject) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // Seguridad: reasignar el body saneado por zod (elimina las claves desconocidas)
      // para que no lleguen campos extra al repositorio (mass-assignment).
      const cleaned = parsed as { body?: unknown };
      if (cleaned && typeof cleaned === 'object' && 'body' in cleaned) {
        req.body = cleaned.body;
      }
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
