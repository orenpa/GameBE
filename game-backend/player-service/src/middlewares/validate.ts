import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { HTTP_STATUS } from '../constants/http.constants';
import { ERROR_MESSAGES } from '../constants/error.constants';

export const validate =
  (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req[property], { abortEarly: false });

    if (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: ERROR_MESSAGES.VALIDATION.FAILED,
        details: error.details.map((d) => d.message),
      });
      return;
    }

    next();
  };
