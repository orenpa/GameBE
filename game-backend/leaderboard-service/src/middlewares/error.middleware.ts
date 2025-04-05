import { Request, Response, NextFunction } from 'express';
import { LOG_ERROR_MESSAGES } from '../constants/log.constants';
import { APP_MESSAGES } from '../constants/app.constants';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(LOG_ERROR_MESSAGES.DEFAULT, err);
  const message = err instanceof Error ? err.message : APP_MESSAGES.ERROR.DEFAULT;
  res.status(500).json({ message });
};
