import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validateRequest } from '../src/middlewares/validateRequest.js';

describe('validateRequest — sanea el body (anti mass-assignment)', () => {
  it('elimina las claves no declaradas en el schema', async () => {
    const schema = z.object({ body: z.object({ title: z.string() }) });
    const req: any = { body: { title: 'ok', hacker: 'DROP TABLE', role: 'admin' }, query: {}, params: {} };
    const next = vi.fn();

    await validateRequest(schema)(req, {} as any, next);

    expect(next).toHaveBeenCalledWith(); // next() sin error
    expect(req.body).toEqual({ title: 'ok' });
    expect(req.body.hacker).toBeUndefined();
    expect(req.body.role).toBeUndefined();
  });

  it('propaga BadRequestError cuando el body es inválido', async () => {
    const schema = z.object({ body: z.object({ title: z.string() }) });
    const req: any = { body: { title: 123 }, query: {}, params: {} };
    const next = vi.fn();

    await validateRequest(schema)(req, {} as any, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
  });
});
