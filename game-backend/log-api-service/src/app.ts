import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';
import { swaggerSpec } from './docs/swagger';
import { errorHandler } from './middlewares/error.middleware';
import { LogController } from './controllers/log.controller';
import { serviceFactory } from './factories/service.factory';

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Create router with dependency-injected controller
const setupLogRoutes = (): Router => {
  const router = Router();
  const batchService = serviceFactory.createRedisBatchService();
  const controller = new LogController(batchService);

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

  return router;
};

// Routes
app.use('/logs', setupLogRoutes());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Log API Service is healthy 📝' });
});

// Global Error Handler
app.use(errorHandler);

export default app;
