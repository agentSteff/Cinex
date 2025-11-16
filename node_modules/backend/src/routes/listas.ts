import { Router } from 'express';
import {
  obtenerMisListas,
  obtenerLista,
  agregarAPorVer,
  marcarComoVista,
  removerDePorVer,
  crearListaPersonalizada,
  agregarAListaPersonalizada,
  eliminarListaPersonalizada
} from '../controllers/listasController';
import { autenticarJWT } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(autenticarJWT);

// Obtener listas
router.get('/mis-listas', obtenerMisListas);
router.get('/:listaId', obtenerLista);

// Listas predeterminadas "Por Ver"
router.post('/por-ver/:peliculaId', agregarAPorVer);
router.delete('/por-ver/:peliculaId', removerDePorVer);

// Marcar como vista
router.post('/marcar-vista/:peliculaId', marcarComoVista);

// Listas personalizadas
router.post('/personalizadas', crearListaPersonalizada);
router.post('/personalizadas/:listaId/peliculas/:peliculaId', agregarAListaPersonalizada);
router.delete('/personalizadas/:listaId', eliminarListaPersonalizada);

export default router;