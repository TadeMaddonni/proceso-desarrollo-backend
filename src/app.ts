import express, { NextFunction } from 'express';
import { HealthController } from './controllers/health/HealthController'; 
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Controllers
const healthController = new HealthController();

// Routes
app.get('/health', healthController.check);


// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});