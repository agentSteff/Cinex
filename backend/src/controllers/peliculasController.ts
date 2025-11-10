import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  buscarPeliculas, 
  obtenerPeliculasPopulares, 
  obtenerPeliculasTop 
} from '../utils/tmdbService';

const prisma = new PrismaClient();

// Buscar películas por título
export const buscar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        error: 'Parámetro de búsqueda "q" requerido'
      });
      return;
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
    console.error('Error en búsqueda:', error);
    res.status(500).json({
      error: 'Error realizando búsqueda de películas'
    });
  }
};

// Obtener películas populares
export const obtenerPopulares = async (req: Request, res: Response): Promise<void> => {
  try {
    const peliculas = await obtenerPeliculasPopulares();

    res.json({
      source: 'tmdb_api',
      count: peliculas.length,
      data: peliculas
    });
  } catch (error) {
    console.error('Error obteniendo populares:', error);
    res.status(500).json({
      error: 'Error obteniendo películas populares'
    });
  }
};

// Top películas (mejor calificadas en nuestra BD)
export const obtenerTop = async (req: Request, res: Response): Promise<void> => {
  try {
    const peliculas = await obtenerPeliculasTop();

    res.json({
      source: 'tmdb_api',
      count: peliculas.length,
      data: peliculas
    });
  } catch (error) {
    console.error('Error en top:', error);
    res.status(500).json({
      error: 'Error obteniendo películas top'
    });
  }
};

// Obtener detalle de película con calificación promedio
// TODO: validar que esto funcione correctamente con TMDB
export const obtenerDetalle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        error: 'ID de película requerido'
      });
      return;
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
      res.status(404).json({
        error: 'Película no encontrada'
      });
      return;
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
    console.error('Error en detalle:', error);
    res.status(500).json({
      error: 'Error obteniendo detalle de película'
    });
  }
};
