import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SYNAPSEAI Backend API', timestamp: new Date().toISOString() });
});

// Auth Routes placeholder
app.get('/api/v1/auth/status', (req, res) => {
  res.json({ message: 'Auth endpoint ready' });
});

app.listen(PORT, () => {
  console.log(`[SYNAPSEAI Backend] Server running on port ${PORT}`);
});
