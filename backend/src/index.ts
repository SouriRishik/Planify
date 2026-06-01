import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import './config/database';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middlewares
app.use(helmet());
app.use(compression());

// Limit request body size
app.use(express.json({ limit: '10kb' }));

// CORS - restrict to frontend origin if provided
const allowedOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({ origin: allowedOrigin }));

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // max requests per IP in window
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // stricter for auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/auth', authLimiter, authRoutes);
app.use('/projects', generalLimiter, projectRoutes);
app.use('/tasks', generalLimiter, taskRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Planify API is running' });
});

app.listen(PORT, () => {
  console.log(`Planify API running on http://localhost:${PORT}`);
});
