import { Router } from 'express';
import {
  buscar,
  obtenerPopulares,
  obtenerTop,
  obtenerDetalle
} from '../controllers/peliculasController';

const router = Router();

// endpoints de películas
router.get('/buscar', buscar);
router.get('/populares', obtenerPopulares);
router.get('/top', obtenerTop);
router.get('/:id', obtenerDetalle);

export default router;
