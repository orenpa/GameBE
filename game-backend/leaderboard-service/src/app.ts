import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middlewares/error.middleware';
import { swaggerSpec } from './docs/swagger';
import { APP_CONFIG } from './constants/app.constants';
import { LeaderboardController } from './controllers/leaderboard.controller';
import { serviceFactory } from './factories/service.factory';

const app = express();

app.use(cors());
app.use(morgan(APP_CONFIG.MORGAN_FORMAT));
app.use(express.json());

// Create router with dependency-injected controller
const setupLeaderboardRoutes = (): Router => {
  const router = Router();
  const leaderboardService = serviceFactory.createLeaderboardService();
  const controller = new LeaderboardController(leaderboardService);

  /**
   * @swagger
   * /players/leaderboard:
   *   get:
   *     summary: Get top players by total score (with pagination)
   *     tags: [Leaderboard]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         required: false
   *         description: "Page number (default: 1)"
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         required: false
   *         description: "Number of results per page (default: 10)"
   *     responses:
   *       200:
   *         description: List of top players with total scores
   */
  router.get('/players/leaderboard', controller.getTopPlayers);

  return router;
};

// Routes
app.use('/', setupLeaderboardRoutes());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Leaderboard Service is healthy' });
});

// Error handling
app.use(errorHandler);

export default app;
