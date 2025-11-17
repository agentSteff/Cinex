import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

/**
 * Obtener calificaciones totales de una película
 * GET /api/calificaciones/pelicula/:peliculaId
 */
export const obtenerCalificacionesPelicula = async (req: Request, res: Response): Promise<void> => {
  try {
    const { peliculaId } = req.params;

    if (!peliculaId) {
      res.status(400).json({
        error: 'ID de película requerido'
      });
      return;
    }

    const calificaciones = await prisma.calificacion.findMany({
      where: {
        peliculaId: parseInt(peliculaId)
      },
      include: {
        usuario: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        fechaCalificacion: 'desc'
      }
    });

    // Calcular estadísticas
    const total = calificaciones.length;
    const promedio = total > 0 
      ? calificaciones.reduce((sum, cal) => sum + cal.puntuacion, 0) / total
      : 0;

    res.json({
      peliculaId: parseInt(peliculaId),
      estadisticas: {
        totalCalificaciones: total,
        promedio: Number(promedio.toFixed(2)),
        distribucion: calcularDistribucion(calificaciones)
      },
      calificaciones: calificaciones.map(cal => ({
        id: cal.id,
        puntuacion: cal.puntuacion,
        comentario: cal.comentario,
        fechaCalificacion: cal.fechaCalificacion,
        fechaActualizacion: cal.fechaActualizacion,
        usuario: cal.usuario
      }))
    });

  } catch (error) {
    console.error('Error obteniendo calificaciones:', error);
    res.status(500).json({
      error: 'Error al obtener calificaciones de la película'
    });
  }
};

/**
 * Ver la calificación que le di a una película
 * GET /api/calificaciones/mi-calificacion/:peliculaId
 */
export const obtenerMiCalificacion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { peliculaId } = req.params;
    const usuarioId = req.usuario?.id;

    if (!peliculaId) {
      res.status(400).json({
        error: 'ID de película requerido'
      });
      return;
    }

    const miCalificacion = await prisma.calificacion.findFirst({
      where: {
        peliculaId: parseInt(peliculaId),
        usuarioId: usuarioId
      },
      select: {
        id: true,
        puntuacion: true,
        comentario: true,
        fechaCalificacion: true,
        fechaActualizacion: true
      }
    });

    res.json({
      peliculaId: parseInt(peliculaId),
      miCalificacion: miCalificacion || null
    });

  } catch (error) {
    console.error('Error obteniendo mi calificación:', error);
    res.status(500).json({
      error: 'Error al obtener tu calificación'
    });
  }
};

/**
 * Calificar una película
 * POST /api/calificaciones
 */
export const calificarPelicula = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.usuario?.id;
    const { peliculaId, puntuacion, comentario } = req.body;

    // Validaciones
    if (!peliculaId || !puntuacion) {
      res.status(400).json({
        error: 'peliculaId y puntuacion son requeridos'
      });
      return;
    }

    if (puntuacion < 1 || puntuacion > 5) {
      res.status(400).json({
        error: 'La puntuación debe estar entre 1 y 5'
      });
      return;
    }

    // Verificar si la película existe en nuestra BD
    const pelicula = await prisma.pelicula.findUnique({
      where: { id: parseInt(peliculaId) }
    });

    if (!pelicula) {
      res.status(404).json({
        error: 'Película no encontrada'
      });
      return;
    }

    // Verificar si ya existe una calificación del usuario
    const calificacionExistente = await prisma.calificacion.findFirst({
      where: {
        peliculaId: parseInt(peliculaId),
        usuarioId: usuarioId
      }
    });

    if (calificacionExistente) {
      res.status(409).json({
        error: 'Ya has calificado esta película. Usa PUT para modificar.'
      });
      return;
    }

    // Crear calificación
    const nuevaCalificacion = await prisma.calificacion.create({
      data: {
        puntuacion: puntuacion,
        comentario: comentario || null,
        peliculaId: parseInt(peliculaId),
        usuarioId: usuarioId!
      },
      include: {
        usuario: {
          select: {
            username: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Película calificada exitosamente',
      calificacion: nuevaCalificacion
    });

  } catch (error) {
    console.error('Error calificando película:', error);
    res.status(500).json({
      error: 'Error al calificar la película'
    });
  }
};

/**
 * Modificar calificación
 * PUT /api/calificaciones/:id
 */
export const modificarCalificacion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario?.id;
    const { puntuacion, comentario } = req.body;

    if (!puntuacion && !comentario) {
      res.status(400).json({
        error: 'Debe proporcionar puntuación o comentario para modificar'
      });
      return;
    }

    if (puntuacion && (puntuacion < 1 || puntuacion > 5)) {
      res.status(400).json({
        error: 'La puntuación debe estar entre 1 y 5'
      });
      return;
    }

    // Verificar que la calificación existe y pertenece al usuario
    const calificacionExistente = await prisma.calificacion.findFirst({
      where: {
        id: parseInt(id),
        usuarioId: usuarioId
      }
    });

    if (!calificacionExistente) {
      res.status(404).json({
        error: 'Calificación no encontrada o no tienes permisos'
      });
      return;
    }

    // Actualizar calificación
    const calificacionActualizada = await prisma.calificacion.update({
      where: { id: parseInt(id) },
      data: {
        ...(puntuacion && { puntuacion }),
        ...(comentario !== undefined && { comentario }),
        fechaActualizacion: new Date()
      },
      include: {
        usuario: {
          select: {
            username: true
          }
        }
      }
    });

    res.json({
      message: 'Calificación actualizada exitosamente',
      calificacion: calificacionActualizada
    });

  } catch (error) {
    console.error('Error modificando calificación:', error);
    res.status(500).json({
      error: 'Error al modificar la calificación'
    });
  }
};

/**
 * Eliminar calificación
 * DELETE /api/calificaciones/:id
 */
export const eliminarCalificacion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario?.id;

    // Verificar que la calificación existe y pertenece al usuario
    const calificacionExistente = await prisma.calificacion.findFirst({
      where: {
        id: parseInt(id),
        usuarioId: usuarioId
      }
    });

    if (!calificacionExistente) {
      res.status(404).json({
        error: 'Calificación no encontrada o no tienes permisos'
      });
      return;
    }

    // Eliminar calificación
    await prisma.calificacion.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Calificación eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando calificación:', error);
    res.status(500).json({
      error: 'Error al eliminar la calificación'
    });
  }
};

// Función auxiliar para calcular distribución de calificaciones
const calcularDistribucion = (calificaciones: any[]) => {
  const distribucion = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  calificaciones.forEach(cal => {
    distribucion[cal.puntuacion as keyof typeof distribucion]++;
  });

  return distribucion;
};