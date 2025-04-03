import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './docs/swagger';
import { errorHandler } from './middlewares/error.middleware';
import logRoutes from './routes/log.routes';

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/logs', logRoutes);

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Log API Service is healthy 📝' });
});

// Global Error Handler
app.use(errorHandler);

export default app;
