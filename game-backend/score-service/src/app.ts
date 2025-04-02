import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import scoreRoutes from './routes/score.routes';

import swaggerUi from 'swagger-ui-express';

import { errorHandler } from './middlewares/error.middleware';
import { swaggerSpec } from './docs/swagger';

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/scores', scoreRoutes);

// Docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Score Service is healthy 🏆' });
});

// Error handler
app.use(errorHandler);

export default app;
