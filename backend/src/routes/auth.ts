import { Router } from 'express';
import { registrar, login, obtenerPerfil } from '../controllers/authController';
import { autenticarJWT } from '../middleware/auth';

const router = Router();

// rutas de autenticación
router.post('/register', registrar);
router.post('/login', login);

// obtener perfil del usuario logueado
router.get('/perfil', autenticarJWT, obtenerPerfil);

export default router;
