import { Router } from 'express';
import { LeaderboardController } from '../controllers/leaderboard.controller';

const router = Router();
const controller = new LeaderboardController();

/**
 * @swagger
 * tags:
 *   name: Leaderboard
 *   description: Aggregated leaderboard based on total player scores
 */

/**
 * @swagger
 * /players/leaderboard:
 *   get:
 *     summary: Get top players by total score
 *     tags: [Leaderboard]
 *     responses:
 *       200:
 *         description: List of top players with total scores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LeaderboardEntry'
 */
router.get('/players/leaderboard', controller.getTopPlayers);

export default router;
