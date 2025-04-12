import { Router } from 'express';
import { LogController } from '../controllers/log.controller';
import { container } from '../container/di-container';
import { IRedisBatchService } from '../interfaces/service.interfaces';

const router = Router();
const batchService = container.get<IRedisBatchService>('redisBatchService');
const controller = new LogController(batchService);

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: Client-side logs collection API
 */

/**
 * @swagger
 * /logs:
 *   post:
 *     summary: Receive log event from client
 *     tags: [Logs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogInput'
 *     responses:
 *       200:
 *         description: Log received and queued for processing
 *       400:
 *         description: Missing required fields
 */
router.post('/', controller.receiveLog);

export default router;
