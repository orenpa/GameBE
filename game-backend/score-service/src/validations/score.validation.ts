import Joi from 'joi';

export const createScoreSchema = Joi.object({
  playerId: Joi.string().required(),
  score: Joi.number().required(),
});
