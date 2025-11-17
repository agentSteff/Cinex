import { Router } from 'express';
import { registrar, login, obtenerPerfil } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', registrar);
router.post('/login', login);
router.get('/perfil', authMiddleware, obtenerPerfil);

export default router;
