import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import './config/database';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Planify API is running' });
});

app.listen(PORT, () => {
  console.log(`Planify API running on http://localhost:${PORT}`);
});
