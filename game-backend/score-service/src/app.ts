import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { ScoreController } from './controllers/score.controller';
import { createScoreSchema } from './validations/score.validation';
import { validate } from './middlewares/validate';
import { errorHandler } from './middlewares/error.middleware';
import { swaggerSpec } from './docs/swagger';
import { serviceFactory } from './factories/service.factory';

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Create router with dependency-injected controller
const setupScoreRoutes = (): Router => {
  const router = Router();
  const scoreService = serviceFactory.createScoreService();
  const controller = new ScoreController(scoreService);

  /**
   * @swagger
   * /scores:
   *   post:
   *     summary: Submit a new score
   *     tags: [Scores]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ScoreInput'
   *     responses:
   *       201:
   *         description: Score submitted successfully
   */
  router.post('/', validate(createScoreSchema), controller.createScore);

  /**
   * @swagger
   * /scores/top:
   *   get:
   *     summary: Get top 10 highest scores
   *     tags: [Scores]
   *     responses:
   *       200:
   *         description: List of top scores
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/LeaderboardEntry'
   */
  router.get('/top', controller.getTopScores);

  return router;
};

// Routes
app.use('/scores', setupScoreRoutes());

// Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Score Service is healthy 🏆' });
});

// Error handler
app.use(errorHandler);

export default app;
