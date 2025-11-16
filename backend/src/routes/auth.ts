// backend/src/routes/auth.ts
import { Router } from 'express';
import { registrar, login, obtenerPerfil } from '../controllers/authController';
import { autenticarJWT } from '../middleware/auth';

const router = Router();

// Registro de usuario nuevo
router.post('/register', registrar);

// Login
router.post('/login', login);

// Ruta protegida de prueba (solo para verificar el token)
router.get('/perfil', autenticarJWT, obtenerPerfil);

// ESTE EXPORT ES CLAVE
export default router;
