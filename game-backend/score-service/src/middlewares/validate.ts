import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate =
  (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req[property], { abortEarly: false });

    if (error) {
      res.status(400).json({
        message: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
      return;
    }

    next();
  };
