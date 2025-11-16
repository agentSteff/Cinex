import { Router } from 'express';
import {
  obtenerCalificacionesPelicula,
  obtenerMiCalificacion,
  calificarPelicula,
  modificarCalificacion,
  eliminarCalificacion
} from '../controllers/calificacionescontroller';
import { autenticarJWT } from '../middleware/auth';

const router = Router();

// GET /api/calificaciones/pelicula/:peliculaId (público o protegido según prefieras)
router.get('/pelicula/:peliculaId', obtenerCalificacionesPelicula);

// Las siguientes rutas requieren autenticación
router.get('/mi-calificacion/:peliculaId', autenticarJWT, obtenerMiCalificacion);
router.post('/', autenticarJWT, calificarPelicula);
router.put('/:id', autenticarJWT, modificarCalificacion);
router.delete('/:id', autenticarJWT, eliminarCalificacion);

export default router;