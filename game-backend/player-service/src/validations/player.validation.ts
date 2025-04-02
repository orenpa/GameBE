import Joi from 'joi';

export const createPlayerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
});

export const updatePlayerSchema = Joi.object({
  username: Joi.string().min(3).max(30),
  email: Joi.string().email(),
}).or('username', 'email'); // At least one must be present
