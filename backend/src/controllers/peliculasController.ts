import { NextFunction, Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { 
  buscarPeliculas, 
  obtenerPeliculasPopulares
} from '../utils/tmdbService';
import { AppError, handleControllerError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

type PeliculaConCalificaciones = Prisma.PeliculaGetPayload<{
  include: { calificaciones: true }
}>;

const GuardarPeliculaSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido'),
  tmdbId: z.number().int('tmdbId debe ser entero').positive('tmdbId debe ser positivo'),
  año: z.number().int().min(1800).max(2100).optional().nullable(),
  genero: z.string().min(1).max(100).optional().nullable(),
  director: z.string().min(1).max(255).optional().nullable(),
  sinopsis: z.string().max(5000).optional().nullable(),
  imagenUrl: z.string().url('imagenUrl debe ser una URL válida').optional().nullable()
});

// Buscar películas por título
export const buscar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return next(new AppError('Parámetro de búsqueda "q" requerido', 400));
    }

    // Llamar a TMDB API
    const peliculas = await buscarPeliculas(q);

    res.json({
      source: 'tmdb_api',
      query: q,
      count: peliculas.length,
      data: peliculas
    });
  } catch (error) {
    handleControllerError(error, next, 'Error realizando búsqueda de películas');
  }
};

// Obtener películas populares
export const obtenerPopulares = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const peliculas = await obtenerPeliculasPopulares();

    res.json({
      source: 'tmdb_api',
      count: peliculas.length,
      data: peliculas
    });
  } catch (error) {
    handleControllerError(error, next, 'Error obteniendo películas populares');
  }
};

// Top películas (mejor calificadas en nuestra BD)
export const obtenerTop = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const peliculas: PeliculaConCalificaciones[] = await prisma.pelicula.findMany({
      include: { calificaciones: true },
      orderBy: [
        { calificaciones: { _count: 'desc' } },
        { fechaAgregada: 'desc' }
      ],
      take: 10
    });

    const data = peliculas.map((pelicula) => {
      const total = pelicula.calificaciones.length;
      const promedio = total === 0
        ? 0
        : pelicula.calificaciones.reduce((sum: number, cal) => sum + cal.puntuacion, 0) / total;

      const { calificaciones, ...resto } = pelicula;
      return {
        ...resto,
        promedio: Number(promedio.toFixed(2)),
        totalCalificaciones: total
      };
    });

    res.json({
      source: 'cinex_db',
      count: data.length,
      data
    });
  } catch (error) {
    handleControllerError(error, next, 'Error obteniendo películas top');
  }
};

// Obtener detalle de película con calificación promedio
// TODO: validar que esto funcione correctamente con TMDB
export const obtenerDetalle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new AppError('ID de película requerido', 400));
    }

    // Buscar película en nuestra BD
    const pelicula = await prisma.pelicula.findUnique({
      where: { id: parseInt(id) },
      include: {
        calificaciones: {
          select: {
            puntuacion: true
          }
        }
      }
    });

    if (!pelicula) {
      return next(new AppError('Película no encontrada', 404));
    }

    // Calcular promedio de calificaciones
    const promedio = pelicula.calificaciones.length > 0
      ? (pelicula.calificaciones.reduce((sum, cal) => sum + cal.puntuacion, 0) / 
          pelicula.calificaciones.length).toFixed(2)
      : 0;

    res.json({
      ...pelicula,
      calificacionPromedio: promedio,
      totalCalificaciones: pelicula.calificaciones.length
    });
  } catch (error) {
    handleControllerError(error, next, 'Error obteniendo detalle de película');
  }
};

// Guardar o actualizar una película proveniente de TMDB
export const guardarDesdeTMDB = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payload = GuardarPeliculaSchema.parse(req.body);

    const previa = await prisma.pelicula.findUnique({ where: { tmdbId: payload.tmdbId } });

    const pelicula = await prisma.pelicula.upsert({
      where: { tmdbId: payload.tmdbId },
      update: {
        titulo: payload.titulo,
        año: payload.año ?? null,
        genero: payload.genero ?? null,
        director: payload.director ?? null,
        sinopsis: payload.sinopsis ?? null,
        imagenUrl: payload.imagenUrl ?? null
      },
      create: {
        titulo: payload.titulo,
        tmdbId: payload.tmdbId,
        año: payload.año ?? null,
        genero: payload.genero ?? null,
        director: payload.director ?? null,
        sinopsis: payload.sinopsis ?? null,
        imagenUrl: payload.imagenUrl ?? null
      }
    });

    res.status(previa ? 200 : 201).json({
      message: 'Película almacenada en la base de datos',
      pelicula
    });
  } catch (error) {
    handleControllerError(error, next, 'Error al guardar película');
  }
};

// Obtener películas filtradas por género almacenado en la BD
export const obtenerPorGenero = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { genero } = req.params;

    if (!genero) {
      return next(new AppError('Debe indicar un género', 400));
    }

    const peliculas: PeliculaConCalificaciones[] = await prisma.pelicula.findMany({
      where: {
        genero: {
          equals: genero,
          mode: 'insensitive'
        }
      },
      include: { calificaciones: true },
      orderBy: { fechaAgregada: 'desc' }
    });

    const data = peliculas.map((pelicula) => {
      const total = pelicula.calificaciones.length;
      const promedio = total === 0
        ? 0
        : pelicula.calificaciones.reduce((sum: number, cal) => sum + cal.puntuacion, 0) / total;

      const { calificaciones, ...resto } = pelicula;
      return {
        ...resto,
        promedio: Number(promedio.toFixed(2)),
        totalCalificaciones: total
      };
    });

    res.json({
      source: 'cinex_db',
      generoBuscado: genero,
      count: data.length,
      data
    });
  } catch (error) {
    handleControllerError(error, next, 'Error al filtrar películas por género');
  }
};
