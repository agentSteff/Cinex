import express from 'express';
import { 
  generateRecommendations,
  getChatRecommendations 
} from '../controllers/recomendacionesController';
import { autenticarJWT } from '../middleware/auth';

const router = express.Router();

// POST /api/recommendations/generate - requires authentication
router.post('/generate', autenticarJWT, generateRecommendations);

// POST /api/recommendations/chat - requires authentication
router.post('/chat', autenticarJWT, getChatRecommendations);

export default router;