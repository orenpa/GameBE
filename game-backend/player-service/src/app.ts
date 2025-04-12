import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { swaggerSpec } from './docs/swagger';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middlewares/error.middleware';
import { Router } from 'express';
import { PlayerController } from './controllers/player.controller';
import { createPlayerSchema, updatePlayerSchema } from './validations/player.validation';
import { validate } from './middlewares/validate';
import { serviceFactory } from './factories/service.factory';

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Create router with dependency-injected controller
const setupRoutes = (): Router => {
  const router = Router();
  const playerService = serviceFactory.createPlayerService();
  const controller = new PlayerController(playerService);

  /**
   * @swagger
   * tags:
   *   name: Players
   *   description: Player management API
   */

  /**
   * @swagger
   * /players:
   *   post:
   *     summary: Create a new player
   *     tags: [Players]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PlayerInput'
   *     responses:
   *       201:
   *         description: The player was created successfully
   */
  router.post('/', validate(createPlayerSchema), controller.createPlayer);

  /**
   * @swagger
   * /players/{id}:
   *   get:
   *     summary: Get player by ID
   *     tags: [Players]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Player ID
   *     responses:
   *       200:
   *         description: Player found
   *       404:
   *         description: Player not found
   */
  router.get('/:playerId', controller.getPlayerById);

  /**
   * @swagger
   * /players/{id}:
   *   put:
   *     summary: Update a player
   *     tags: [Players]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Player ID
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PlayerInput'
   *     responses:
   *       200:
   *         description: Player updated
   */
  router.put('/:playerId', validate(updatePlayerSchema), controller.updatePlayer);

  /**
   * @swagger
   * /players/{id}:
   *   delete:
   *     summary: Delete a player
   *     tags: [Players]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Player ID
   *     responses:
   *       204:
   *         description: Player deleted
   */
  router.delete('/:playerId', controller.deletePlayer);

  return router;
};

app.use('/players', setupRoutes());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(errorHandler);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Player Service is healthy 💪' });
});

export default app;
