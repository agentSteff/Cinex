import { Router } from 'express';
import {
  buscar,
  obtenerPopulares,
  obtenerTop,
  obtenerDetalle,
  guardarDesdeTMDB,
  obtenerPorGenero
} from '../controllers/peliculasController';
import { autenticarJWT } from '../middleware/auth';

const router = Router();

// endpoints de películas
router.get('/buscar', buscar);
router.get('/populares', obtenerPopulares);
router.get('/top', obtenerTop);
router.get('/genero/:genero', obtenerPorGenero);
router.get('/:id', obtenerDetalle);
router.post('/', autenticarJWT, guardarDesdeTMDB);

export default router;
