import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Error:', err);

  const message = err instanceof Error ? err.message : 'Something went wrong';

  res.status(500).json({ message });
};
