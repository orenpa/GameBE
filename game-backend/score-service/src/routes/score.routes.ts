import { Router } from 'express';
import { ScoreController } from '../controllers/score.controller';
import { createScoreSchema } from '../validations/score.validation';
import { validate } from '../middlewares/validate';

const router = Router();
const controller = new ScoreController();

/**
 * @swagger
 * tags:
 *   name: Scores
 *   description: Score submission and leaderboard API
 */

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

export default router;
