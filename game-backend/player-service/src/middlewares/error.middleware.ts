import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../constants/http.constants';
import { GENERAL } from '../constants/general.constants';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Unhandled error:', err);

  const message =
    err instanceof Error ? err.message : GENERAL.DEFAULT_ERROR_MESSAGE;

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message,
  });
};
