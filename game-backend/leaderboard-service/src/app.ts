import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import leaderboardRoutes from './routes/leaderboard.routes';
import { swaggerSpec } from './docs/swagger';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middlewares/error.middleware';
import { APP_CONFIG } from './constants/app.constants';

const app = express();

app.use(cors());
app.use(morgan(APP_CONFIG.MORGAN_FORMAT));
app.use(express.json());

// Routes
app.use('/', leaderboardRoutes);

// Swagger documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Leaderboard Service is healthy' });
});

// Error handling
app.use(errorHandler);

export default app;
