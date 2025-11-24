import axios from 'axios';
import { PeliculaTMDB } from '../types';
import { appConfig } from '../config/env';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: appConfig.TMDB_API_KEY,
    language: 'es-ES'
  }
});

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutos

let popularCache: CacheEntry<PeliculaTMDB[]> | null = null;
const searchCache = new Map<string, CacheEntry<PeliculaTMDB[]>>();
const detalleCache = new Map<number, CacheEntry<PeliculaTMDB | null>>();
const detalleExtrasCache = new Map<number, CacheEntry<{ duracion?: number; genero?: string; director?: string } | null>>();

const isEntryValid = <T>(entry: CacheEntry<T> | null | undefined): entry is CacheEntry<T> => {
  return Boolean(entry && entry.expiresAt > Date.now());
};

const createCacheEntry = <T>(value: T): CacheEntry<T> => ({
  value,
  expiresAt: Date.now() + CACHE_TTL_MS
});

interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  poster_path: string | null;
  genre_ids: number[];
  vote_average: number;
}

const mapearPelicula = (movie: TMDBMovie): PeliculaTMDB => ({
  titulo: movie.title,
  año: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
  sinopsis: movie.overview,
  imagenUrl: movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
    : null,
  tmdbId: movie.id,
  calificacionTMDB: movie.vote_average
});

// Fetch detalle para un id de película de TMDB para obtener duración, género, director
async function fetchMovieDetail(tmdbId: number): Promise<{ duracion?: number; genero?: string; director?: string } | null> {
  const cached = detalleExtrasCache.get(tmdbId);
  if (isEntryValid(cached)) {
    return cached.value;
  }

  try {
    // Solicita el detalle de la película incluyendo créditos para extraer el director
    const response = await tmdbClient.get(`/movie/${tmdbId}`, { params: { append_to_response: 'credits' } });
    const data = response.data;
    const duracion = data.runtime ?? undefined;
    const genero = Array.isArray(data.genres) && data.genres.length > 0 ? data.genres[0].name : undefined;
    const director = data.credits?.crew?.find((c: any) => c.job === 'Director' || c.department === 'Directing')?.name;
    const detalle = { duracion, genero, director };
    detalleExtrasCache.set(tmdbId, createCacheEntry(detalle));
    return detalle;
  } catch (err) {
    // Retorna null para que los endpoints de lista sigan funcionando
    const errorMsg = (err && typeof err === 'object' && 'message' in err) ? (err as any).message : String(err);
    console.warn(`TMDB detail fetch failed for ${tmdbId}:`, errorMsg);
    detalleExtrasCache.set(tmdbId, createCacheEntry(null));
    return null;
  }
}

export const buscarPeliculas = async (query: string): Promise<PeliculaTMDB[]> => {
  try {
    const cacheKey = query.trim().toLowerCase();
    const cached = searchCache.get(cacheKey);
    if (isEntryValid(cached)) {
      return cached.value;
    }

    const response = await tmdbClient.get('/search/movie', {
      params: { query }
    });
    
    const mapped = response.data.results.map(mapearPelicula);
    // Enriquece los resultados mapeados con detalle (duración, género) en paralelo, pero no falla en caso de error
    await Promise.all(mapped.map(async (m: PeliculaTMDB) => {
      const detail = await fetchMovieDetail(m.tmdbId);
      if (detail) {
        m.duracion = detail.duracion;
        m.genero = detail.genero;
        if (detail.director) {
          m.director = detail.director;
        }
      }
    }));
    searchCache.set(cacheKey, createCacheEntry(mapped));
    return mapped;
  } catch (error) {
    console.error('Error buscando películas en TMDB:', String(error));
    throw new Error('Error consultando TMDB API');
  }
};

export const obtenerPeliculasPopulares = async (): Promise<PeliculaTMDB[]> => {
  try {
    if (isEntryValid(popularCache)) {
      return popularCache.value;
    }

    const response = await tmdbClient.get('/movie/popular');
    const mapped = response.data.results.map(mapearPelicula);
    await Promise.all(mapped.map(async (m: PeliculaTMDB) => {
      const detail = await fetchMovieDetail(m.tmdbId);
      if (detail) {
        m.duracion = detail.duracion;
        m.genero = detail.genero;
        if (detail.director) {
          m.director = detail.director;
        }
      }
    }));
    popularCache = createCacheEntry(mapped);
    return mapped;
  } catch (error) {
    console.error('Error obteniendo películas populares:', String(error));
    throw new Error('Error consultando TMDB API');
  }
};

export const obtenerPeliculasTop = async (): Promise<PeliculaTMDB[]> => {
  try {
    const response = await tmdbClient.get('/movie/top_rated');
    return response.data.results.map(mapearPelicula);
  } catch (error) {
    console.error('Error obteniendo top películas:', String(error));
    throw new Error('Error consultando TMDB API');
  }
};

// Obtener detalle completo de una película por TMDB id (incluye runtime y géneros)
export const obtenerPeliculaDetalle = async (tmdbId: number): Promise<PeliculaTMDB | null> => {
  const cached = detalleCache.get(tmdbId);
  if (isEntryValid(cached)) {
    return cached.value;
  }

  try {
    // Solicita el detalle de la película incluyendo créditos para extraer el director
    const response = await tmdbClient.get(`/movie/${tmdbId}`, { params: { append_to_response: 'credits' } });
    const data = response.data;
    const director = data.credits?.crew?.find((c: any) => c.job === 'Director' || c.department === 'Directing')?.name;
    const pelicula: PeliculaTMDB = {
      titulo: data.title,
      año: data.release_date ? new Date(data.release_date).getFullYear() : null,
      sinopsis: data.overview,
      imagenUrl: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
      tmdbId: data.id,
      calificacionTMDB: data.vote_average,
      duracion: data.runtime ?? undefined,
      genero: Array.isArray(data.genres) && data.genres.length > 0 ? data.genres[0].name : undefined,
      director: director ?? undefined
    };
    detalleCache.set(tmdbId, createCacheEntry(pelicula));
    return pelicula;
  } catch (err) {
    console.warn(`Failed to fetch TMDB detail for ${tmdbId}:`, String(err));
    detalleCache.set(tmdbId, createCacheEntry(null));
    return null;
  }
};

// Enriquece un array de películas (desde la base de datos) con datos de TMDB (calificación, duración, etc.)
export async function enriquecerPeliculasConTMDB<T extends { tmdbId?: number | null }>(peliculas: T[]): Promise<T[]> {
  if (!peliculas.length) return peliculas;

  const uniqueTmdbIds = Array.from(new Set(
    peliculas
      .map((pelicula) => pelicula.tmdbId)
      .filter((id): id is number => typeof id === 'number' && Number.isFinite(id))
  ));

  if (uniqueTmdbIds.length === 0) {
    return peliculas;
  }

  const cache = new Map<number, PeliculaTMDB | null>();

  await Promise.all(
    uniqueTmdbIds.map(async (tmdbId) => {
      const detalle = await obtenerPeliculaDetalle(tmdbId);
      cache.set(tmdbId, detalle);
    })
  );

  return peliculas.map((pelicula) => {
    if (!pelicula.tmdbId) return pelicula;
    const detalle = cache.get(pelicula.tmdbId);
    if (!detalle) return pelicula;

    return {
      ...pelicula,
      calificacionTMDB: detalle.calificacionTMDB,
      director: (pelicula as any).director ?? detalle.director,
      genero: (pelicula as any).genero ?? detalle.genero,
      sinopsis: (pelicula as any).sinopsis ?? detalle.sinopsis,
      imagenUrl: (pelicula as any).imagenUrl ?? detalle.imagenUrl,
      año: (pelicula as any).año ?? detalle.año,
      duracion: (pelicula as any).duracion ?? detalle.duracion
    } as T;
  });
}
