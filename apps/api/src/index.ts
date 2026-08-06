import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRouter from './routes/ai.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SYNAPSEAI Backend API', timestamp: new Date().toISOString() });
});

// AI Service Express Router Mount
app.use(aiRouter);
app.use('/api/v1', aiRouter);

app.listen(PORT, () => {
  console.log(`[SYNAPSEAI Backend] Server running on port ${PORT}`);
});
