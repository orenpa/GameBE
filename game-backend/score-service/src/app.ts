import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Score Service is healthy 🏆' });
});

// TODO: Mount routes here

export default app;
