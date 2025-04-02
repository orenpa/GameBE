import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import playerRoutes from './routes/player.routes';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/players', playerRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Player Service is healthy 💪' });
});
// Error handler
app.use(errorHandler);

export default app;
