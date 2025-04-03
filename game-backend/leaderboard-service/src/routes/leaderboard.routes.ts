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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LeaderboardEntry'
 */
router.get('/players/leaderboard', controller.getTopPlayers);

export default router;
