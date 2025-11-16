import { Router } from 'express';

const router = Router();

// TODO: Implementar
// GET /api/listas/por-ver
// GET /api/listas/vistas
// POST /api/listas/por-ver/:peliculaId
// POST /api/listas/vistas/:peliculaId
// DELETE /api/listas/:id

router.get('/', (req, res) => {
  res.json({ message: 'Listas routes - Pendiente de implementar' });
});

export default router;
