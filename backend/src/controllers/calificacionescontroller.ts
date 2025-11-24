import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError, handleControllerError } from '../middleware/errorHandler';
import { obtenerPeliculaDetalle } from '../utils/tmdbService';

const prisma = new PrismaClient();

// Helper: resolver película por ID de BD o tmdbId (ambos pasados como numéricos). Si no se encuentra,
// intentar obtener de TMDB y persistir, retornando el registro de BD.
async function resolveOrCreatePeliculaByIdOrTmdb(numericId: number) {
  if (Number.isNaN(numericId)) return null;

  // Intentar primero con ID de BD
  let pelicula = await prisma.pelicula.findUnique({ where: { id: numericId } });
  if (pelicula) return pelicula;

  // Intentar con tmdbId
  pelicula = await prisma.pelicula.findUnique({ where: { tmdbId: numericId } });
  if (pelicula) return pelicula;

  // Intentar obtener de TMDB y crear en BD
  const detalle = await obtenerPeliculaDetalle(numericId);
  if (!detalle) return null;

  const nueva = await prisma.pelicula.create({
    data: {
      titulo: detalle.titulo,
      tmdbId: detalle.tmdbId,
      año: detalle.año ?? null,
      genero: detalle.genero ?? null,
      director: detalle.director ?? null,
      sinopsis: detalle.sinopsis ?? null,
      imagenUrl: detalle.imagenUrl ?? null
    }
  });

  return nueva;
}

// Helper: resolver ID de película para operaciones de solo lectura sin crear nuevas entradas.
async function resolvePeliculaIdForRead(numericId: number) {
  if (Number.isNaN(numericId)) return null;

  const peliculaById = await prisma.pelicula.findUnique({ where: { id: numericId } });
  if (peliculaById) return peliculaById.id;

  const peliculaByTmdb = await prisma.pelicula.findUnique({ where: { tmdbId: numericId } });
  if (peliculaByTmdb) return peliculaByTmdb.id;

  return null;
}

/**
 * Obtener calificaciones totales de una película
 * GET /api/calificaciones/pelicula/:peliculaId
 */
export const obtenerCalificacionesPelicula = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { peliculaId } = req.params;

    if (!peliculaId) {
      return next(new AppError('ID de película requerido', 400));
    }

    const numericId = parseInt(peliculaId, 10);
    if (Number.isNaN(numericId)) {
      return next(new AppError('ID de película inválido', 400));
    }

    // Resolver ID de película si se pasó un tmdbId
    const peliculaResolved = await resolveOrCreatePeliculaByIdOrTmdb(numericId);
    const targetPeliculaId = peliculaResolved ? peliculaResolved.id : numericId;

    const calificaciones = await prisma.calificacion.findMany({
      where: {
        peliculaId: targetPeliculaId
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
      peliculaId: numericId,
      promedio: Number(promedio.toFixed(2)),
      total: total,
      distribucion: calcularDistribucion(calificaciones),
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
    handleControllerError(error, next, 'Error al obtener calificaciones de la película');
  }
};

/**
 * Ver la calificación que le di a una película
 * GET /api/calificaciones/mi-calificacion/:peliculaId
 */
export const obtenerMiCalificacion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { peliculaId } = req.params;
    const usuarioId = req.usuario?.id;

    if (!peliculaId) {
      return next(new AppError('ID de película requerido', 400));
    }

    if (!usuarioId) {
      return next(new AppError('No autorizado', 401));
    }

    // Resolver ID de película si se pasó un tmdbId (no crear nueva película aquí)
    const numericId = parseInt(peliculaId, 10);
    if (Number.isNaN(numericId)) {
      return next(new AppError('ID de película inválido', 400));
    }

    const peliculaResolved = await prisma.pelicula.findUnique({ where: { tmdbId: numericId } });
    const targetPeliculaId = peliculaResolved ? peliculaResolved.id : numericId;

    const miCalificacion = await prisma.calificacion.findFirst({
      where: {
        peliculaId: targetPeliculaId,
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

    res.json(miCalificacion || null);

  } catch (error) {
    handleControllerError(error, next, 'Error al obtener tu calificación');
  }
};

/**
 * Calificar una película
 * POST /api/calificaciones
 */
export const calificarPelicula = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usuarioId = req.usuario?.id;
    const { peliculaId, puntuacion, comentario } = req.body;

    if (!usuarioId) {
      return next(new AppError('No autorizado', 401));
    }

    // Validaciones
    if (!peliculaId || !puntuacion) {
      return next(new AppError('peliculaId y puntuacion son requeridos', 400));
    }

    if (puntuacion < 1 || puntuacion > 5) {
      return next(new AppError('La puntuación debe estar entre 1 y 5', 400));
    }

    // Resolver película por ID de BD o tmdbId, creando desde TMDB si es necesario
    const numericId = parseInt(String(peliculaId), 10);
    if (Number.isNaN(numericId)) {
      return next(new AppError('peliculaId inválido', 400));
    }

    const pelicula = await resolveOrCreatePeliculaByIdOrTmdb(numericId);
    if (!pelicula) {
      return next(new AppError('Película no encontrada', 404));
    }

    // Verificar si ya existe una calificación del usuario
    const calificacionExistente = await prisma.calificacion.findFirst({
      where: {
        peliculaId: pelicula.id,
        usuarioId: usuarioId
      }
    });

    if (calificacionExistente) {
      return next(new AppError('Ya has calificado esta película. Usa PUT para modificar.', 409));
    }

    // Crear calificación
    const nuevaCalificacion = await prisma.calificacion.create({
      data: {
        puntuacion: puntuacion,
        comentario: comentario || null,
        peliculaId: pelicula.id,
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
    handleControllerError(error, next, 'Error al calificar la película');
  }
};

/**
 * Modificar calificación
 * PUT /api/calificaciones/:id
 */
export const modificarCalificacion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario?.id;
    const { puntuacion, comentario } = req.body;

    if (!usuarioId) {
      return next(new AppError('No autorizado', 401));
    }

    if (!puntuacion && !comentario) {
      return next(new AppError('Debe proporcionar puntuación o comentario para modificar', 400));
    }

    if (puntuacion && (puntuacion < 1 || puntuacion > 5)) {
      return next(new AppError('La puntuación debe estar entre 1 y 5', 400));
    }

    // Verificar que la calificación existe y pertenece al usuario
    const calificacionExistente = await prisma.calificacion.findFirst({
      where: {
        id: parseInt(id),
        usuarioId: usuarioId
      }
    });

    if (!calificacionExistente) {
      return next(new AppError('Calificación no encontrada o no tienes permisos', 404));
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
    handleControllerError(error, next, 'Error al modificar la calificación');
  }
};

/**
 * Eliminar calificación
 * DELETE /api/calificaciones/:id
 */
export const eliminarCalificacion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return next(new AppError('No autorizado', 401));
    }

    // Verificar que la calificación existe y pertenece al usuario
    const calificacionExistente = await prisma.calificacion.findFirst({
      where: {
        id: parseInt(id),
        usuarioId: usuarioId
      }
    });

    if (!calificacionExistente) {
      return next(new AppError('Calificación no encontrada o no tienes permisos', 404));
    }

    // Eliminar calificación
    await prisma.calificacion.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Calificación eliminada exitosamente'
    });

  } catch (error) {
    handleControllerError(error, next, 'Error al eliminar la calificación');
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

/**
 * Obtener estadísticas (promedio y total) de una película
 * GET /api/calificaciones/estadisticas/:peliculaId
 */
export const obtenerEstadisticasPelicula = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { peliculaId } = req.params;

    if (!peliculaId) {
      return next(new AppError('ID de película requerido', 400));
    }

    const numericId = parseInt(peliculaId, 10);
    if (Number.isNaN(numericId)) {
      return next(new AppError('ID de película inválido', 400));
    }

    const resolvedId = await resolvePeliculaIdForRead(numericId);
    const targetPeliculaId = resolvedId ?? numericId;

    const aggregate = await prisma.calificacion.aggregate({
      where: {
        peliculaId: targetPeliculaId
      },
      _avg: {
        puntuacion: true
      },
      _count: {
        _all: true
      }
    });

    const promedio = aggregate._avg.puntuacion ?? 0;
    const total = aggregate._count?._all ?? 0;

    res.json({
      peliculaId: numericId,
      promedio: Number(promedio.toFixed(2)),
      total
    });
  } catch (error) {
    handleControllerError(error, next, 'Error al obtener estadísticas de calificaciones');
  }
};